using AccessedServices.AccessedServices.Services;
using GoA.UiamRpClientLib.Identity;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using AccessedServices.AccessedServices.Features.GettingAccessedServices.V1;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class GetAccessedServicesPreviewEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/preview/accessed-services",
                async (HttpContext httpContext,
                ILogger<GetAccessedServicesPreviewEndpoint> logger,
                IMediator mediator,
                CancellationToken cancellationToken) =>
                {
                    var user = (httpContext.User as User);
                    if (user == null)
                    {
                        throw new InvalidOperationException("Couldn't resolve user.");
                    }
                    if (user.PrimaryEmailAddress == null)
                    {
                        throw new InvalidOperationException("Couldn't resolve email address.");
                    }
                    if (!user.IsVerified())
                    {
                        throw new InvalidOperationException("User is not verified.");
                    }
                    var result = await mediator.Send(new GetAccessedServices(user.PrimaryEmailAddress));
                    var response = result.Adapt<GetAccessedServicesResponseDto>();
                    return Results.Ok(response);
                })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("GetAccessedServicesPreview")
            .WithApiVersionSet(builder.NewApiVersionSet("Admin").Build())
            .Produces<IList<GetAccessedServicesResponseDto>>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Get Accessed Services by User ID for Preview")
            .WithDescription("Get Accessed Services by User ID for Preview by Admin")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
