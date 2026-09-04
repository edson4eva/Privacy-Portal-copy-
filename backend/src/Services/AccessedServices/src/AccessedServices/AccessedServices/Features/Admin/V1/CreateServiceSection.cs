
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
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Services;
using Libs.Audit;
using Newtonsoft.Json;
using AccessedServices.AccessedServices.Services.Publish;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{

    public record CreateServiceSection(string ServiceId, ServiceSectionDto ServiceSectionDto) : IRequest<CreateServiceSectionResult> { }

    public record CreateServiceSectionResult(ServiceSectionDto Dto);

    public record CreateServiceSectionResponseDto(string Id);

    public class CreateServiceSectionEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/services/{{serviceId}}/sections",
            async (string serviceId, ServiceSectionDto requestDto, IMediator mediator, IMapper mapper,
            CancellationToken cancellationToken) =>
            {
                var command = new CreateServiceSection(serviceId, requestDto);
                var result = await mediator.Send(command, cancellationToken);
                var response = result.Adapt<CreateServiceSectionResponseDto>();

                return Results.Ok(response);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .AddEndpointFilter<PublishStatusCheckEndpointFilter>()
            .WithName("CreateServiceSection")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<CreateServiceSectionResponseDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Add a new section")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    public class CreateServiceSectionValidator : AbstractValidator<CreateServiceSection>
    {
        public CreateServiceSectionValidator()
        {
            string[] origin = { Origin.UIAM, Origin.EServices };
            RuleFor(x => x.ServiceSectionDto.Title).NotNull().NotEmpty().WithMessage("Title is required.");
            RuleFor(x => x.ServiceSectionDto.Content).NotNull().NotEmpty().WithMessage("Content is required.");
        }
    }

    internal class CreateServiceSectionCommandHandler(IDraftServiceRepository serviceRepository, IPublishWorkflowManager workflowManager, 
        IAdminAuditLogService auditLogService) : IRequestHandler<CreateServiceSection, CreateServiceSectionResult>
    {
        public async Task<CreateServiceSectionResult> Handle(CreateServiceSection request, CancellationToken cancellationToken)
        {
            Guard.Against.Null(request, nameof(request));

            var createServiceSectionDto = request.ServiceSectionDto;
            var serviceSection = createServiceSectionDto.Adapt<ServiceDataSection>();

            var service = await serviceRepository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }
            if (service.Sections == null)
            {
                service.Sections = [];
            }
            service.Sections.Add(serviceSection);

            await serviceRepository.UpdateAsync(service, new PartitionKey(request.ServiceId));
            await workflowManager.NewDraftModification();
            auditLogService.LogCreateServiceSection(request, service);            

            var dto = new ServiceSectionDto()
            {
                Title = serviceSection.Title,
                Content = serviceSection.Content
            };            
            return new CreateServiceSectionResult(dto);
        }
    }
}
