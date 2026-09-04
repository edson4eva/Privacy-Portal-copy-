using GoA.UiamRpClientLib.Identity;
using Libs.Auth;
using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.ManageAccess.V1
{

    public record GetIsAuthenticatedResponseDto(string AccessedServices);
    public class AccessUser : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/is-authenticated",
            (HttpContext httpContext, ILogger<string> logger, CancellationToken cancellationToken) =>
            {
                User? user = (httpContext.User as User);
                var isAuthenticated = user?.Identity?.IsAuthenticated ?? false;

                var response = new SignInStatus
                {
                    IsAuthenticated = isAuthenticated,
                    Claims = user?.ToUserClaims(),
                    UserMenu = user?.UserMenu,
                    IsVerified = user?.IsVerified() ?? false,
                };
                return Results.Ok(response);
            })
            .WithName("isAuthenticated")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<GetIsAuthenticatedResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return if user is authenticated or not")
            .WithDescription("Check if user is authenticated")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
