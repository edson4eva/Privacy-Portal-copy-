using AccessedServices.AccessedServices.Services;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using AccessedServices.AccessedServices.Features.GettingAccessedServiceDetails.V1;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class GetAccessedServiceDetailsPreviewEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/preview/accessed-services/{{ServiceId}}",
            async (string ServiceId, HttpContext httpContext, ILogger<GetAccessedServicesPreviewEndpoint> logger, IMediator mediator, IMapper mapper, CancellationToken cancellationToken) =>
            {
                var user = httpContext.User as GoA.UiamRpClientLib.Identity.User;
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
                    throw new InvalidOperationException("User is not verified");
                }

                var result = await mediator.Send(new GetAccessedServiceDetails(user.PrimaryEmailAddress, ServiceId));
                var response = result.Adapt<GetAccessedServiceDetailsResponseDto>();
                return Results.Ok(response);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("GetAccessedServiceDetailsPreview")
            .WithApiVersionSet(builder.NewApiVersionSet("Admin").Build())
            .Produces<GetAccessedServiceDetailsResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Get Accessed Service Details by Service Id for preview")
            .WithDescription("Get Accessed Service Details by Service Id for preview by Admin")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
