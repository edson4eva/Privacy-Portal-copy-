using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data;
using AccessedServices.Data.Publish;
using FluentValidation;
using Libs.Utils;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record StartPublishResult(PublishWorkflowStatus status);
    public record StartPublish(PublishDescriptionDto Dto) : IRequest<StartPublishResult>;
    public class StartPublishEndpoint : IMinimalEndpoint
    {
        private void Print(ILogger logger, string fieldName, string fieldValue, bool mask=false)
        {
            var value = mask ? fieldValue.MaskStringEnding(4) : fieldValue;
            logger.LogInformation($"{fieldName}: {value}");
        }
        private void PrintSettings(ILogger logger, AdminPublishSettings settings)
        {
            if (settings != null)
            {
                Print(logger, "DevAccountEndpointUrl", settings.DevAccountEndpointUrl);
                Print(logger, "DevAccountKey", settings.DevAccountKey, true);
                Print(logger, "DevPreviewTable", settings.DevPreviewTable);
                Print(logger, "DevServiceTable", settings.DevServiceTable);
                Print(logger, "DevRedisServer", settings.DevRedisServer);
                Print(logger, "DevRedisPassword", settings.DevRedisPassword, true);

                Print(logger, "UatAccountEndpointUrl", settings.UatAccountEndpointUrl);
                Print(logger, "UatAccountKey", settings.UatAccountKey, true);
                Print(logger, "UatPreviewTable", settings.UatPreviewTable);
                Print(logger, "UatServiceTable", settings.UatServiceTable);
                Print(logger, "UatRedisServer", settings.UatRedisServer);
                Print(logger, "UatRedisPassword", settings.UatRedisPassword, true);

                Print(logger, "ProdAccountEndpointUrl", settings.ProdAccountEndpointUrl);
                Print(logger, "ProdAccountKey", settings.ProdAccountKey, true);
                Print(logger, "ProdPreviewTable", settings.ProdPreviewTable);
                Print(logger, "ProdServiceTable", settings.ProdServiceTable);
                Print(logger, "ProdRedisServer", settings.ProdRedisServer);
                Print(logger, "ProdRedisPassword", settings.ProdRedisPassword, true);
            }
            else
            {
                logger.LogInformation("AdminPublishSettings is empty");
            }
        }
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/admin/start-publish",
                async (PublishDescriptionDto dto, HttpContext httpContext
                , IMapper mapper
                , IOptions<AdminPublishSettings> options
                    , ILogger<StartPublishEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {
                    PrintSettings(logger, options.Value);
                    var result = await mediator.Send(new StartPublish(dto));
                    return Results.Ok(result);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("StartPublish")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<StartPublishResult>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Start Publish")
                .WithDescription("Start Publish Workflow")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    public class StartPublishValidator : AbstractValidator<StartPublish>
    {
        public StartPublishValidator()
        {
            RuleFor(x => x.Dto.Description).NotEmpty().WithMessage("Description cannot be empty");
        }
    }

    internal class StartPublishHandler(IMapper mapper, IPublishWorkflowRepository publishWorkflowRepository, IPublishService publishService, IAdminAuditLogService adminAuditLogService) : IRequestHandler<StartPublish, StartPublishResult>
    {
        public async Task<StartPublishResult> Handle(StartPublish request, CancellationToken cancellationToken)
        {
            var workflow = await publishWorkflowRepository.GetCurrent();
            if (workflow == null)//It only happens when the publish occurs for the first time.
            {
                await publishWorkflowRepository.AddAsync(new PublishWorkflowStatus() { Id = PublishWorkflowStatus.CURRENT, Guid = Guid.NewGuid().ToString(), Status = (int)PublishStatus.NotStarted }, new PartitionKey(PublishWorkflowStatus.CURRENT));
                workflow = await publishWorkflowRepository.GetCurrent();
            }
            
            var status = (PublishStatus)workflow!.Status;
            if(status != PublishStatus.NotStarted)
            {
                throw new InvalidOperationException("Workflow already started!");
            }
            await publishService.Publish(PublishEnvironment.DEV);

            workflow.Description = request.Dto.Description;
            workflow.InitiatedAt = DateTime.Now;
            workflow.Status = (int)PublishStatus.InDevelopment;

            await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
            adminAuditLogService.LogStartPublish(request, workflow);
            return new StartPublishResult(workflow);
        }
    }
    }
