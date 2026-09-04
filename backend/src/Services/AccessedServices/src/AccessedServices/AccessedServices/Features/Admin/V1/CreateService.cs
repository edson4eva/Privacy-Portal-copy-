
using Ardalis.GuardClauses;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using FluentValidation;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using AccessedServices.Data;
using AccessedServices.AccessedServices.Services;
using System.Text.RegularExpressions;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Shared.Constants;
using Libs.Utils;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{

    public record CreateService(string Id, CreateServiceRequestDto CreateServiceDto) : IRequest<CreateServiceResult> { }

    public record CreateServiceResult(string Id);

    //    public record CreateServiceRequestDto(string Id, string ServiceName, string BadgeText, bool IsAvailable, bool ShowOnUI, string Origin, string? RPId, string? Sku);


    public record CreateServiceRequestDto(string ServiceName, string Description, string CategoryId,
                            string[] DataOwnerIds, string Origin, string? RPId, string? RPIdforUAT, string? Sku, string AccessServiceUrl,
                            bool? ShowMockInDev, bool? IsAvailable);

    public record CreateServiceResponseDto(string Id);

    public class CreateServiceEndpoint : IMinimalEndpoint
    {
        private string GenerateServiceId(string serviceName)
        {
            if (string.IsNullOrWhiteSpace(serviceName))
            {
                return string.Empty;
            }
            else
            {
                var id = Regex.Replace(serviceName.Trim(), @"[^0-9a-zA-Z\._\s]", " ");
                id = Regex.Replace(id, @"\s+", "-").ToLower();
                return id;
            }
        }
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/createservice", async (CreateServiceRequestDto requestDto, IMediator mediator,
                IMapper mapper,
                CancellationToken cancellationToken) =>
            {
                var id = GenerateServiceId(requestDto.ServiceName);
                var command = new CreateService(id, requestDto);

                var result = await mediator.Send(command, cancellationToken);

                var response = result.Adapt<CreateServiceResponseDto>();

                return Results.Ok(response);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .AddEndpointFilter<PublishStatusCheckEndpointFilter>()
            .WithName("CreateService")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<CreateServiceResponseDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Add a new service")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    public class CreateServiceValidator : AbstractValidator<CreateService>
    {
        private readonly IDraftServiceRepository _repo;
        public CreateServiceValidator(IDraftServiceRepository repo)
        {
            _repo = repo;
            //stop further validation if any failure
            ClassLevelCascadeMode = CascadeMode.Stop;
            string[] origin = { Origin.UIAM, Origin.EServices };
            RuleFor(x => x.CreateServiceDto.ServiceName).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SERVICE_NAME_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.SERVICE_NAME_TOO_LONG);
            RuleFor(x => x.CreateServiceDto.Description).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SERVICE_DESC_MISSING)
                .Length(1, 5000).WithMessage(ServiceValidationErrors.SERVICE_DESC_TOO_LONG);
            RuleFor(x => x.CreateServiceDto.CategoryId).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.CATEGORY_MISSING)
                .Must(x => Categories.Items.Keys.Contains(x)).WithMessage(ServiceValidationErrors.INVALID_CATEGORY);
            RuleFor(x => x.CreateServiceDto.DataOwnerIds).Must(x => x != null && x.Count() > 0).WithMessage(ServiceValidationErrors.DATA_OWNER_MISSING)
                .Must(x => x.All(id => Ministries.Items.Keys.Contains(id))).WithMessage(ServiceValidationErrors.INVALID_DATAOWNER);
            RuleFor(x => x.CreateServiceDto.AccessServiceUrl)
                .Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SERVICE_LINK_MISSING);
            RuleFor(x => x.CreateServiceDto.AccessServiceUrl)
                .Must(x => x.IsUrl()).WithMessage(ServiceValidationErrors.INVALID_SERVICE_LINK);
            RuleFor(x => x.CreateServiceDto.ShowMockInDev).NotNull().WithMessage(ServiceValidationErrors.SHOW_MOCK_IN_DEV_MISSING);
            RuleFor(x => x.CreateServiceDto.Origin).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.ORIGIN_MISSING)
                .Must(x => origin.Contains(x)).WithMessage(ServiceValidationErrors.INVALID_ORIGIN);
            When(x => x.CreateServiceDto.Origin == Origin.UIAM, () =>
            {
                RuleFor(x => x.CreateServiceDto.RPId).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.RP_ID_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.RPID_TOO_LONG);
                RuleFor(x => x.CreateServiceDto.RPIdforUAT).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.RP_ID_UAT_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.RPID_UAT_TOO_LONG);
            });
            When(x => x.CreateServiceDto.Origin == Origin.EServices, () =>
            {
                RuleFor(x => x.CreateServiceDto.Sku).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SKU_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.SKU_TOO_LONG);
            });
            RuleFor(x => x.CreateServiceDto.IsAvailable).NotNull().WithMessage(ServiceValidationErrors.SERVICE_AVAILABILITY_MISSING);
            RuleFor(x => x.Id)
                .MustAsync(
                async (serviceId, cancellationToken) =>
                {
                    var service = await _repo.GetByIdAsync(serviceId, new PartitionKey(serviceId));
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_NAME_CONFLICT);
            RuleFor(x => x.CreateServiceDto.ServiceName).MustAsync(
                async (serviceName, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByName(serviceName, string.Empty);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_NAME_CONFLICT);

            When(x => x.CreateServiceDto.Origin == Origin.UIAM, () =>
            {
                RuleFor(x => x.CreateServiceDto.RPId).MustAsync(
                async (rpId, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByRpId(rpId, string.Empty);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_RPID_CONFLICT);

                RuleFor(x => x.CreateServiceDto.RPIdforUAT).MustAsync(
                async (rpIdForUat, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByUatRpId(rpIdForUat, string.Empty);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_RPID_UAT_CONFLICT);
            });
            When(x => x.CreateServiceDto.Origin == Origin.EServices, () =>
            {
                RuleFor(x => x.CreateServiceDto.Sku).MustAsync(
                async (sku, cancellationToken) =>
                {
                    var service = await _repo.GetServiceBySku(sku, string.Empty);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_SKU_CONFLICT);
            });
        }
    }

    internal class CreateServiceCommandHandler(IDraftServiceRepository serviceRepository, IPublishWorkflowManager workflowManager,
        IAdminAuditLogService auditLogService) : IRequestHandler<CreateService, CreateServiceResult>
    {
        public async Task<CreateServiceResult> Handle(CreateService command, CancellationToken cancellationToken)
        {
            Guard.Against.Null(command, nameof(command));
            var createServiceDto = command.CreateServiceDto;
            //explicitly map RpIdforUAT
            TypeAdapterConfig<CreateServiceRequestDto, DraftService>
            .NewConfig()
            .Map(dest => dest.RPIdForUAT, src => src.RPIdforUAT);

            var service = createServiceDto.Adapt<DraftService>();
            service.Id = command.Id;
            service.ShowOnUI = true;
            service.Sections = DefaultServiceData.CreateDefaultAccordions();
            if (service.Sku != null)
            {
                service.Sku = service.Sku.Trim();
            }
            if (service.RPId != null)
            {
                service.RPId = service.RPId.Trim();
            }
            if (service.RPIdForUAT != null)
            {
                service.RPIdForUAT = service.RPIdForUAT.Trim();
            }
            await serviceRepository.AddAsync(service, new PartitionKey(service.Id));
            await workflowManager.NewDraftModification();
            auditLogService.LogCreateService(command);
            return new CreateServiceResult(service.Id);
        }


    }
}
