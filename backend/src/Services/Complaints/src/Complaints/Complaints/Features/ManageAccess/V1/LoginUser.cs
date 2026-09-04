using Complaints.Complaints.Dtos;
using Complaints.Data;
using FluentValidation;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using GoA.UiamRpClientLib.Settings;
using Microsoft.AspNetCore.Authentication;
using System.Configuration;
using System.Net.Http;
using System;
using System.Net;
using Libs.Auth;
using Libs.Audit;

namespace Complaints.Complaints.Features.GettingComplaints.V1
{
    public record LoginUserRedirect(string? returnUrl) : IRequest<LoginUserRedirectResult>;

    public record LoginUserRedirectResult();

    //public record LoginUserRedirectResponseDto();

    public class LoginUser : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/signin",
            async (string? returnUrl
            , HttpContext httpContext
            , IConfiguration configuration
            , IMapper mapper
            , IAuditLogService auditLogService
            , CancellationToken cancellationToken) =>
            {
                var customSettings = configuration.GetSection("UiamSettings").Get<UiamSettings>();
                auditLogService.Log(ServiceCategory.Complaints, "Signin");
                //if (customSettings != null && !string.IsNullOrWhiteSpace(customSettings.SpaUri))
                //{
                //var endingWihSlash = customSettings.SpaUri.EndsWith("/")?"":"/";
                //returnUrl = returnUrl ?? "";
                //var url = $"{customSettings.SpaUri}{endingWihSlash}{returnUrl}";
                //return Results.Redirect(url);
                //}
                if (string.IsNullOrEmpty(returnUrl))
                    return Results.Ok();
                else
                {
                    return Results.Redirect(returnUrl);
                }

                //return Results.Ok();
            })
            .RequireAuthorization()
            .WithName("SignIn")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Direct user to login")
            .WithDescription("Not logined user get redirect to login page")
            .WithOpenApi()
            .HasApiVersion(1.0);
            //.RequireCors();

            builder.MapGet($"{EndpointConfig.BaseApiPath}/signout",
            async (HttpContext httpContext
            , ILogger<string> logger
            , IConfiguration configuration
            , IAuditLogService auditLogService
            , CancellationToken cancellationToken) =>
            {
                var customSettings = configuration.GetSection("UiamSettings").Get<UiamSettings>();
                auditLogService.Log(ServiceCategory.Complaints, "Signout");
                await httpContext.SignOutAsync();
                httpContext.RemoveCookieWithPrefix();

                if (customSettings != null && !string.IsNullOrWhiteSpace(customSettings.SpaUrl))
                {
                    var url = $"{customSettings.SpaUrl}/signed-out";
                    httpContext.Response.Redirect(url);
                    return Results.Redirect(url);  
                }
                else
                {
                    return Results.Redirect("/loggedout");
                }

            })
            .RequireAuthorization()
            .WithName("Signout")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Sign out")
            .WithDescription("Sign out from the api and security service provider")
            .WithOpenApi()
            .HasApiVersion(1.0);

            builder.MapGet($"{EndpointConfig.BaseApiPath}/loggedout", (HttpContext httpContext) =>
            {
                return Results.Ok(new { Message = "You are now logged out." });
                //return new JsonResult(new { Message = "You are now logged out." });
            })
            .WithName("logged-out")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .WithSummary("logged out")
            .WithDescription("Already logged out from the api and security service provider")
            .WithOpenApi()
            .HasApiVersion(1.0);


            return builder;
        }

    }
}
