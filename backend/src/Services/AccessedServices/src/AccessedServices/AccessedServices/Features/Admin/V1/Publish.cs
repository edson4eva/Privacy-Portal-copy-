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
using AccessedServices.Data;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record PublishResult(PublishWorkflowStatus status);
    public record PublishRequest(EnvironmentDto Dto) : IRequest<PublishResult>;

    public class PublishEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/admin/publish",
                async (EnvironmentDto dto, HttpContext httpContext
                , IMapper mapper
                    , ILogger<PublishEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {

                    var result = await mediator.Send(new PublishRequest(dto));
                    return Results.Ok(result);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("PublishServices")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<PublishResult>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Publish workflow")
                .WithDescription("Publish Workflow")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    public class PublishValidator : AbstractValidator<PublishRequest>
    {
        public PublishValidator()
        {
            RuleFor(x => x.Dto.env).NotEmpty().Must(x=>PublishEnvironment.Contains(x)).WithMessage("env must be dev|uat|prod");
        }
    }
    internal class PublishHandler(IMapper mapper, IPublishWorkflowRepository publishWorkflowRepository, IPublishService publishService, 
        IAdminAuditLogService auditLogService) : IRequestHandler<PublishRequest, PublishResult>
    {
        private void ValidateWorkflowStatus(string env, PublishStatus status)
        {
            switch (status)
            {
                case PublishStatus.NotStarted:
                    throw new InvalidOperationException("Workflow is not started yet!");
                case PublishStatus.InDevelopment:
                    if (env != PublishEnvironment.DEV)
                    {
                        throw new InvalidOperationException("can only deploy to dev");
                    }
                    break;
                case PublishStatus.InUAT:
                    if (env != PublishEnvironment.UAT)
                    {
                        throw new InvalidOperationException("can only deploy to uat");
                    }
                    break;
                case PublishStatus.InProduction:
                    if (env != PublishEnvironment.PROD)
                    {
                        throw new InvalidOperationException("can only deploy to prod");
                    }
                    break;
                case PublishStatus.Completed:
                default:
                    throw new InvalidOperationException("Workflow error");
            }
        }
        private async Task UpdateWorkflow(PublishWorkflowStatus workflow)
        {
            var status = (PublishStatus)workflow.Status;
            switch (status)
            {
                case PublishStatus.NotStarted:
                    break;
                case PublishStatus.InDevelopment:
                    workflow.Status = (int)PublishStatus.InUAT;
                    workflow.ConfirmedInDevAt = DateTime.Now;
                    await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
                    break;
                case PublishStatus.InUAT:
                    workflow.Status = (int)PublishStatus.InProduction;
                    workflow.ConfirmedInUATAt = DateTime.Now;
                    await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
                    break;
                case PublishStatus.InProduction:
                    workflow.Status = (int)PublishStatus.Completed;
                    workflow.CompletedAt = DateTime.Now;
                    await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
                    break;
                case PublishStatus.Completed:
                default:
                    break;
            }
        }
        public async Task<PublishResult> Handle(PublishRequest request, CancellationToken cancellationToken)
        {
            var workflow = await publishWorkflowRepository.GetCurrent();
            if (workflow == null)
            {
                throw new InvalidOperationException("workflow not found!");
            }
            else
            {
                var status = (PublishStatus)workflow.Status;
                ValidateWorkflowStatus(request.Dto.env, status);
            }
            
            if(request.Dto.env == PublishEnvironment.DEV)
            {
                await publishService.ConfirmChanges(PublishEnvironment.DEV);
                await publishService.Publish(PublishEnvironment.UAT);
            }else if(request.Dto.env == PublishEnvironment.UAT)
            {
                await publishService.ConfirmChanges(PublishEnvironment.UAT);
                await publishService.Publish(PublishEnvironment.PROD);
            }else if(request.Dto.env == PublishEnvironment.PROD)
            {
                await publishService.ConfirmChanges(PublishEnvironment.PROD);
            }

            await UpdateWorkflow(workflow);
            auditLogService.LogPublish(request, workflow);
            var result = new PublishResult(workflow);
            return result;
        }
    }
}
