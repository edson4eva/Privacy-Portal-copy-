using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using FluentValidation;
using Libs.Web;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using MapsterMapper;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Extensions.Logging;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using Mapster;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data.Publish;
using Libs.Audit;
using Humanizer;
using AccessedServices.Data;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record RollbackResult(PublishWorkflowStatus status);
    public record Rollback() : IRequest<RollbackResult>;

    public class RollbackEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/admin/rollback",
                async (HttpContext httpContext
                , IMapper mapper
                    , ILogger<RollbackEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {

                    var result = await mediator.Send(new Rollback());
                    return Results.Ok(result);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("Rollback")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<RollbackResult>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Rollback Publish workflow")
                .WithDescription("Rollback Publish Workflow")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class RollbackHandler(IMapper mapper, IPublishWorkflowRepository publishWorkflowRepository, IPublishService publishService, IAdminAuditLogService adminAuditLogService) : IRequestHandler<Rollback, RollbackResult>
    {
        private void ValidateWorkflowStatus(PublishStatus status)
        {
            if(status == PublishStatus.Completed)
            {
                throw new InvalidOperationException("Workflow error");
            }
        }
        private async Task UpdateWorkflow(PublishWorkflowStatus workflow)
        {
            var status = (PublishStatus)workflow.Status;

            switch(status)
            {
                case PublishStatus.InProduction:
                    workflow.Status = (int)PublishStatus.InUAT;
                    workflow.ConfirmedInUATAt = null;
                    break;
                case PublishStatus.InUAT:
                    workflow.Status = (int)PublishStatus.InDevelopment;
                    workflow.ConfirmedInDevAt = null;
                    break;
                case PublishStatus.InDevelopment:
                    workflow.Status = (int)PublishStatus.NotStarted;
                    workflow.PreviewedInDev = false;
                    workflow.PreviewedInUAT = false;
                    workflow.PreviewedInProd = false;
                    workflow.CompletedAt = null;
                    workflow.ConfirmedInUATAt = null;
                    workflow.ConfirmedInDevAt = null;
                    workflow.CompletedAt = null;
                    workflow.InitiatedAt = null;
                    break;
                default: 
                    break;
            }
            
            await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
        }
        public async Task<RollbackResult> Handle(Rollback request, CancellationToken cancellationToken)
        {
            var workflow = await publishWorkflowRepository.GetCurrent();
            if (workflow == null)
            {
                throw new InvalidOperationException("workflow not found!");
            }
            else
            {
                var status = (PublishStatus)workflow.Status;
                ValidateWorkflowStatus(status);
                if (status == PublishStatus.InProduction)
                {
                    await publishService.Rollback(PublishEnvironment.PROD);
                    await UpdateWorkflow(workflow);
                    status = (PublishStatus)workflow.Status;
                }
                if (status == PublishStatus.InUAT)
                {
                    await publishService.Rollback(PublishEnvironment.UAT);
                    await UpdateWorkflow(workflow);
                    status = (PublishStatus)workflow.Status;
                }
                if (status == PublishStatus.InDevelopment)
                {
                    await publishService.Rollback(PublishEnvironment.DEV);
                    await UpdateWorkflow(workflow);
                }
                adminAuditLogService.LogRollback(request, workflow);
            }
            var result = new RollbackResult(workflow);
            return result;
        }
    }
}
