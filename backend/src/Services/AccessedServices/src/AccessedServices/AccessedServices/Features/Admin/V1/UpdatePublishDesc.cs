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
using FluentValidation;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record UpdatePublishDescResult(PublishWorkflowStatus status);
    public record UpdatePublishDesc(PublishDescriptionDto Dto) : IRequest<UpdatePublishDescResult>;
    public class UpdatePublishDescEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/admin/update-publish-desc",
                async (PublishDescriptionDto dto, HttpContext httpContext
                , IMapper mapper
                    , ILogger<UpdatePublishDescEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {

                    var result = await mediator.Send(new UpdatePublishDesc(dto));
                    return Results.Ok(result);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("UpdatePublishDesc")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<UpdatePublishDescResult>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Update Publish Description")
                .WithDescription("Update Publish Description")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    public class UpdatePublishDescValidator : AbstractValidator<UpdatePublishDesc>
    {
        public UpdatePublishDescValidator()
        {
            RuleFor(x => x.Dto.Description).NotEmpty().WithMessage("Description cannot be empty");
        }
    }

    internal class UpdatePublishDescHandler(IMapper mapper, IPublishWorkflowRepository publishWorkflowRepository, IAdminAuditLogService adminAuditLogService) : IRequestHandler<UpdatePublishDesc, UpdatePublishDescResult>
    {
        public async Task<UpdatePublishDescResult> Handle(UpdatePublishDesc request, CancellationToken cancellationToken)
        {
            var workflow = await publishWorkflowRepository.GetCurrent();
            if (workflow == null)
            {
                throw new InvalidOperationException("workflow not found!");
            }
            else
            {
                workflow.Description = request.Dto.Description;
                await publishWorkflowRepository.UpdateAsync(workflow, new PartitionKey(workflow.Id));
                adminAuditLogService.LogUpdatePublishDescription(request, workflow);
                return new UpdatePublishDescResult(workflow);
            }
        }
    }
}
