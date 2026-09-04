using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data;
using FluentValidation;
using Libs.Audit;
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
    public record DeleteServiceSectionResult(ServiceDetailDto Dto);
    public record DeleteServiceSection(string ServiceId, string Index) : IRequest<DeleteServiceSectionResult>;
    public class DeleteServiceSectionEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapDelete($"{EndpointConfig.BaseApiPath}/services/{{ServiceId}}/sections/{{index}}",
            async (string ServiceId, string index, HttpContext httpContext, ILogger<DeleteServiceSectionEndpoint> logger, IAuditLogService auditLogService, 
            IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new DeleteServiceSection(ServiceId, index));
                return Results.Ok(result.Dto);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .AddEndpointFilter<PublishStatusCheckEndpointFilter>()
            .WithName("DeleteServiceSection")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<ServiceDetailDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Delete the draft service section")
            .WithDescription("Delete the draft service section")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
    internal class DeleteServiceSectionHandler(IDraftServiceRepository serviceRepository, IPublishWorkflowManager publishWorkflowManager, 
        IAdminAuditLogService auditLogService) : IRequestHandler<DeleteServiceSection, DeleteServiceSectionResult>
    {
        public async Task<DeleteServiceSectionResult> Handle(DeleteServiceSection request, CancellationToken cancellationToken)
        {
            int index;
            if (!int.TryParse(request.Index, out index))
            {
                throw new InvalidIArrayIndexException();
            }
            var service = await serviceRepository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }
            if (service.Sections == null || service.Sections.Count <= index)
            {
                throw new InvalidIArrayIndexException();
            }
            var section = service.Sections[index];
            service.Sections.RemoveAt(index);

            await serviceRepository.UpdateAsync(service, new PartitionKey(request.ServiceId));
            await publishWorkflowManager.NewDraftModification();
            auditLogService.LogDeleteServiceSection(request, section, service);
            var dto = service.Adapt<ServiceDetailDto>();

            return new DeleteServiceSectionResult(dto);
        }
    }
}
