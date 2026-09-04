using System.Net;
using FluentValidation;
using GoA.UiamRpClientLib.Settings;
using Libs.Audit;
using Libs.Auth;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.ManageAccess.V1
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

                auditLogService.Log(ServiceCategory.AccountHistory, "Signin");

                if (customSettings != null && !string.IsNullOrWhiteSpace(customSettings.SpaUrl))
                {
                    var url = $"{customSettings.SpaUrl}{returnUrl}";
                    return Results.Redirect(url);
                }

                return Results.Ok();
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
                
                auditLogService.Log(ServiceCategory.AccountHistory, "Signout");

                await httpContext.SignOutAsync();
                httpContext.RemoveCookieWithPrefix();

                if (customSettings != null && !string.IsNullOrWhiteSpace(customSettings.SpaUrl))
                {
                    var url = $"{customSettings.SpaUrl}/signed-out";
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
            .WithApiVersionSet(builder.NewApiVersionSet("AccessedServices").Build())
            .WithSummary("logged out")
            .WithDescription("Already logged out from the api and security service provider")
            .WithOpenApi()
            .HasApiVersion(1.0);


            return builder;
        }

    }
    //public class LoginUserRedirectValidator : AbstractValidator<LoginUserRedirect>
    //{
    //    public LoginUserRedirectValidator()
    //    {
    //        RuleFor(x => x.returnUrl).NotEmpty().WithMessage("UserId is required!");
    //    }
    //}

    //internal class LoginUserRedirectHandler : IRequestHandler<LoginUserRedirect, LoginUserRedirectResult>
    //{
    //    private readonly IMapper _mapper;
    //    private readonly IComplaintRepository _complaintRepository;
    //    public LoginUserRedirectHandler(IMapper mapper, IComplaintRepository complaintRepository)
    //    {
    //        _mapper = mapper;
    //        _complaintRepository = complaintRepository;
    //    }
    //    public async Task<LoginUserRedirectResult> Handle(LoginUserRedirect request, CancellationToken cancellationToken)
    //    {
    //        var complaints = await _complaintRepository.LoginUserRedirectAsync(request.UserId);

    //        var complaintDtos = _mapper.Map<IEnumerable<GetComplaintDto>>(complaints);

    //        return new LoginUserRedirectResult(complaintDtos);
    //    }
    //}
}
