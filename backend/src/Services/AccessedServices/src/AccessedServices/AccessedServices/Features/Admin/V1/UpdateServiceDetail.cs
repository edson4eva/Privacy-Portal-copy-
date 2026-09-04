using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data;
using AccessedServices.Shared.Constants;
using FluentValidation;
using GoA.UiamRpClientLib.Helpers;
using Google.Api;
using Libs.Audit;
using Libs.Utils;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record UpdateServiceDetailResult(ServiceDetailDto Dto);
    public record UpdateServiceDetail(string ServiceId, ServiceDetailDto Dto) : IRequest<UpdateServiceDetailResult>;
    public class UpdateServiceDetailEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPut($"{EndpointConfig.BaseApiPath}/services/{{ServiceId}}",
            async (string ServiceId, ServiceDetailDto dto, HttpContext httpContext, ILogger<UpdateServiceDetailEndpoint> logger, IAuditLogService auditLogService, IDraftServiceRepository serviceRepository, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new UpdateServiceDetail(ServiceId, dto));
                return Results.Ok(result.Dto);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .AddEndpointFilter<PublishStatusCheckEndpointFilter>()
            .WithName("UpdateServiceDetail")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<ServiceDetailDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Update the draft service details")
            .WithDescription("Update the draft service details")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    public class UpdateServiceDetailValidator : AbstractValidator<UpdateServiceDetail>
    {
        private readonly IDraftServiceRepository _repo;
        public UpdateServiceDetailValidator(IDraftServiceRepository repo)
        {
            _repo = repo;
            ClassLevelCascadeMode = CascadeMode.Stop;
            var origins = new List<string> { Origin.EServices, Origin.UIAM };
            When(x => x.Dto.ServiceName != null, () =>
            {
                RuleFor(x => x.Dto.ServiceName).Must(x => !string.IsNullOrWhiteSpace(x))
                    .WithMessage(ServiceValidationErrors.SERVICE_NAME_MISSING)
                    .Length(1, 100).WithMessage(ServiceValidationErrors.SERVICE_NAME_TOO_LONG);
            });
            When(x => x.Dto.CategoryId != null, () =>
            {
                RuleFor(x => x.Dto.CategoryId).Must(x => Categories.Items.Keys.Contains(x)).WithMessage(ServiceValidationErrors.INVALID_CATEGORY);
            });
            When(x => x.Dto.Origin != null, () =>
            {
                RuleFor(x => x.Dto.Origin).Must(x => origins.Contains(x)).WithMessage(ServiceValidationErrors.INVALID_ORIGIN);
            });
            When(x => x.Dto.RPId != null, () =>
            {
                RuleFor(x => x.Dto.RPId).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.RP_ID_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.RPID_TOO_LONG);
            });
            When(x => x.Dto.RPIdForUAT != null, () =>
            {
                RuleFor(x => x.Dto.RPIdForUAT).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.RP_ID_UAT_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.RPID_UAT_TOO_LONG);
            });
            When(x => x.Dto.Sku != null, () =>
            {
                RuleFor(x => x.Dto.Sku).NotEmpty().Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SKU_MISSING)
                .Length(1, 100).WithMessage(ServiceValidationErrors.SKU_TOO_LONG);
            });
            When(x => x.Dto.Description != null, () =>
            {
                RuleFor(x => x.Dto.Description).Must(x => !string.IsNullOrWhiteSpace(x)).WithMessage(ServiceValidationErrors.SERVICE_DESC_MISSING)
                .Length(1, 5000).WithMessage(ServiceValidationErrors.SERVICE_DESC_TOO_LONG);
            });
            When(x => x.Dto.DataOwnerIds != null, () =>
            {
                RuleFor(x => x.Dto.DataOwnerIds).Must(x => x.All(id => Ministries.Items.Keys.Contains(id))).WithMessage(ServiceValidationErrors.INVALID_DATAOWNER);
            });
            When(x => !string.IsNullOrEmpty(x.Dto.AccessServiceUrl), () =>
            {
                RuleFor(x => x.Dto.AccessServiceUrl).Must(url => url.IsUrl()).WithMessage(ServiceValidationErrors.INVALID_SERVICE_LINK);
            });
            When(x => x.Dto.ServiceName != null, () =>
            {
                RuleFor(x => x).MustAsync(
                async (command, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByName(command.Dto.ServiceName, command.ServiceId);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_NAME_CONFLICT);
            });
            When(x => x.Dto.RPId != null, () =>
            {
                RuleFor(x => x).MustAsync(
                async (command, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByRpId(command.Dto.RPId, command.ServiceId);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_RPID_CONFLICT);
            });
            When(x => x.Dto.RPIdForUAT != null, () =>
            {
                RuleFor(x => x).MustAsync(
                async (command, cancellationToken) =>
                {
                    var service = await _repo.GetServiceByUatRpId(command.Dto.RPIdForUAT, command.ServiceId);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_RPID_UAT_CONFLICT);
            });
            When(x => x.Dto.Sku != null, () =>
            {
                RuleFor(x => x).MustAsync(
                async (command, cancellationToken) =>
                {
                    var service = await _repo.GetServiceBySku(command.Dto.Sku, command.ServiceId);
                    return service == null;
                }).WithMessage(ServiceValidationErrors.SERVICE_SKU_CONFLICT);
            });
        }
    }

    internal class UpdateServiceLogDescriptionHandler(IDraftServiceRepository serviceRepository, IPublishWorkflowManager publishWorkflowManager,
        IAdminAuditLogService auditLogService) : IRequestHandler<UpdateServiceDetail, UpdateServiceDetailResult>
    {
        public async Task<UpdateServiceDetailResult> Handle(UpdateServiceDetail request, CancellationToken cancellationToken)
        {
            var service = await serviceRepository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }

            var resultDto = service.Adapt<ServiceDetailDto>();
            var changes = request.Dto.CollectChanges(service);
            if (changes.Count > 0)
            {
                var updatedService = request.Dto.Adapt(service);
                if (updatedService.Origin == Origin.UIAM)
                {
                    updatedService.Sku = null;
                }
                else
                {
                    updatedService.RPId = null;
                    updatedService.RPIdForUAT = null;
                }
                if (updatedService.Sku != null)
                {
                    updatedService.Sku = updatedService.Sku.Trim();
                }
                if (updatedService.RPId != null)
                {
                    updatedService.RPId = updatedService.RPId.Trim();
                }
                if (updatedService.RPIdForUAT != null)
                {
                    updatedService.RPIdForUAT = updatedService.RPIdForUAT.Trim();
                }
                await serviceRepository.UpdateAsync(updatedService, new PartitionKey(request.ServiceId));
                await publishWorkflowManager.NewDraftModification();
                auditLogService.LogUpdateServiceDetails(request, changes);
                resultDto = updatedService.Adapt<ServiceDetailDto>();
            }

            return new UpdateServiceDetailResult(resultDto);
        }
    }
}
