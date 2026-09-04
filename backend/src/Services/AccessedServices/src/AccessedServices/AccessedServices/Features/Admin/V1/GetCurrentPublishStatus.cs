using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data.Publish;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record GetCurrentPublishStatus() : IRequest<PublishWorkflowStatusDto>;
    public class GetCurrentPublishStatusEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/admin/publish-status",
            async (HttpContext httpContext, ILogger<string> logger, IMediator mediator) =>
            {
                var req = new GetCurrentPublishStatus();
                var status = await mediator.Send(req);
                return Results.Ok(status);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("GetCurrentPublishStatus")
            .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
            .Produces<PublishWorkflowStatusDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return current publish status")
            .WithDescription("return current publish status")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }        
    }
    internal class GetCurrentPublishStatusHandler(IPublishWorkflowRepository repo, IPublishService publishService)
        : IRequestHandler<GetCurrentPublishStatus, PublishWorkflowStatusDto>
    {
        public async Task<PublishWorkflowStatusDto> Handle(GetCurrentPublishStatus request, CancellationToken cancellationToken)
        {
            var status = await repo.GetByIdAsync(PublishWorkflowStatus.CURRENT, new PartitionKey(PublishWorkflowStatus.CURRENT));
            var result = status.Adapt<PublishWorkflowStatusDto>();
            if(publishService == null || publishService is DummyPublishService)
            {
                result.IsPublishDisabled = true;
            }
            return result;
        }
    }
}
