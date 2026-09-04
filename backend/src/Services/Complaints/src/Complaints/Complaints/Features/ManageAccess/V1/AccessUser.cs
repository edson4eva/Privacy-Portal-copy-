using Libs.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Libs.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Services;
using GoA.UiamRpClientLib.Settings;
using GoA.UiamRpClientLib.ServiceModels;
using GoA.UiamRpClientLib.Identity;

namespace Complaints.Complaints.Features.ManageAccess.V1
{

    public record GetAccessedServicesByUserIdResponseDto(string AccessedServices);
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
            .Produces<GetAccessedServicesByUserIdResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return if user is authenticated or not")
            .WithDescription("Check if user is authenticated")            
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
