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

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record ClickPreviewResult(PublishWorkflowStatus status);
    public record ClickPreview(EnvironmentDto Dto) : IRequest<ClickPreviewResult>;

    public class ClickReviewEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/admin/set-previewed",
                async (EnvironmentDto dto, HttpContext httpContext
                , IMapper mapper
                    , ILogger<ClickReviewEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {

                    var result = await mediator.Send(new ClickPreview(dto));
                    return Results.Ok(result);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("ClickPreview")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<ClickPreviewResult>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Click Preview Link")
                .WithDescription("Click Preview Link")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    public class ClickReviewValidator : AbstractValidator<ClickPreview>
    {
        public ClickReviewValidator()
        {
            RuleFor(x => x.Dto.env).NotEmpty().Must(x => PublishEnvironment.Contains(x)).WithMessage("env must be dev|uat|prod");
        }
    }
    internal class ClickReviewHandler : IRequestHandler<ClickPreview, ClickPreviewResult>
    {

        private readonly IPublishWorkflowRepository _publishWorkflowRepo;
        private readonly IPublishService _publishService;

        public ClickReviewHandler(IMapper mapper, IPublishWorkflowRepository publishWorkflowRepository, IPublishService publishService)
        {
            _publishWorkflowRepo = publishWorkflowRepository;
            _publishService = publishService;
        }
        private void ValidateWorkflowStatus(string env, PublishStatus status)
        {
            switch (status)
            {
                case PublishStatus.NotStarted:
                    throw new InvalidOperationException("Workflow is not started yet!");
                case PublishStatus.InDevelopment:
                    if (env != PublishEnvironment.DEV)
                    {
                        throw new InvalidOperationException("can preview in DEV only");
                    }
                    break;
                case PublishStatus.InUAT:
                    if (env != PublishEnvironment.UAT)
                    {
                        throw new InvalidOperationException("can preview in UAT only");
                    }
                    break;
                case PublishStatus.InProduction:
                    if (env != PublishEnvironment.PROD)
                    {
                        throw new InvalidOperationException("can preview in PROD only");
                    }
                    break;
                case PublishStatus.Completed:
                default:
                    throw new InvalidOperationException("Workflow error");
            }
        }
        public async Task<ClickPreviewResult> Handle(ClickPreview request, CancellationToken cancellationToken)
        {
            var workflow = await _publishWorkflowRepo.GetCurrent();
            if (workflow == null)
            {
                throw new InvalidOperationException("workflow not found!");
            }
            else
            {
                var status = (PublishStatus)workflow.Status;
                ValidateWorkflowStatus(request.Dto.env, status);
            }
            switch(request.Dto.env)
            {
                case PublishEnvironment.DEV:
                    workflow.PreviewedInDev = true;
                    break;
                case PublishEnvironment.UAT:
                    workflow.PreviewedInUAT = true;
                    break;
                case PublishEnvironment.PROD:
                    workflow.PreviewedInProd = true;
                    break;
                default:
                    break;
            }
            await _publishWorkflowRepo.UpdateAsync(workflow, new PartitionKey(workflow.Id));
            var result = new ClickPreviewResult(workflow);
            return result;
        }
    }
}
