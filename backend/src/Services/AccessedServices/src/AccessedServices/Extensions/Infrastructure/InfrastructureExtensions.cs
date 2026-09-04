using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Libs.Web;
using Libs.Swagger;
using Libs.Cors;
using Libs.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Refit;
using Libs.Mapster;
using AccessedServices.AccessedServices.Services;
using GoA.UiamRpClientLib.Authentication;
using GoA.UiamRpClientLib.Settings;
using Libs.ProblemDetails;
using Libs.Logging;
using Libs.Tracing;
using Libs.HealthCheck;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Libs.Audit;
using Libs.Dapr;
using Libs.Utils;
using AccessedServices.Data;
using Serilog;

namespace AccessedServices.Extensions.Infrastructure
{
    public static class InfrastructureExtensions
    {
        public static WebApplicationBuilder AddInfrastructure(this WebApplicationBuilder builder)
        {
            var configuration = builder.Configuration;
            var env = builder.Environment;

            builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });
            builder.Services.Configure<AdminPublishSettings>(configuration.GetSection("PublishSettings"));

            builder.Services.AddHttpClient();
            builder.Services.AddCustomVersioning();
            builder.AddCustomSerilog();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddCors(configuration);
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddCustomSwagger(configuration, typeof(AccessedServicesRoot).Assembly);
            builder.Services.AddCustomMapster(typeof(AccessedServicesRoot).Assembly);
            builder.Services.AddDaprClient();
            builder.Services.AddCustomMediatR();
            builder.Services.AddValidatorsFromAssembly(typeof(AccessedServicesRoot).Assembly);
            builder.Services.AddProblemDetails();
            builder.Services.AddCustomOpenTelemetry();
            builder.Services.AddCosmosDb(configuration);
            builder.Services.AddRepositories();
            builder.Services.AddSingleton<IDaprClient,DaprClientWrapper>();
            builder.Services.AddAuditLogService();
            builder.Services.AddAccessLogService(configuration);
            builder.Services.AddSingleton<IHashingService, SHA256HashingService>();
            builder.Services.AddCustomRefit(configuration);
            builder.Services.AddCustomHealthCheck();
            builder.Services.AddAuthorization(option =>
            {
                option.AddPolicy(AdminRoleRequirement.ADMIN_POLICY, policy => policy.AddRequirements(new AdminRoleRequirement()));
            });
            builder.Services.AddSingleton<IAuthorizationHandler, AdminRoleRequirementHandler>();
            builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, AdminRoleAuthorizationResultHandler>();
            builder.Services.AddRequestDecompression();
            builder.Services.AddAdminServices(configuration);


            //var customUiamSettings = builder.Configuration.GetSection("CustomUiamSettings").Get<CustomUiamSettings>();
            //var uiamOptions = new UiamOptions
            //{
            //    LoginPath = "/UiamSignIn",
            //    LogoutPath = "/UiamSignOut",
            //    AccessDeniedPath = "/UiamAccessDenied",
            //    RelyingPartyEntityId = customUiamSettings.RelyingPartyEntityId,
            //};
            //builder.Services.AddUiam(uiamOptions);

            return builder;
        }

        public static WebApplication UseInfrastructure(this WebApplication app)
        {
            var env = app.Environment;
            var appOptions = app.GetOptions<AppOptions>(nameof(AppOptions));
            app.UseCustomProblemDetails();
            app.UseCorrelationId();
            app.UseEnrichLog();
            app.UseSerilogRequestLogging(options =>
            {
                options.EnrichDiagnosticContext = LogEnrichHelper.EnrichFromRequest;
            });
            app.MapGet("/", x => x.Response.WriteAsync(appOptions.Name));
            if (env.ShouldEnableSwagger())
            {
                app.UseCustomSwagger();
            }
            app.UseCors();
            return app;
        }
    }
}
