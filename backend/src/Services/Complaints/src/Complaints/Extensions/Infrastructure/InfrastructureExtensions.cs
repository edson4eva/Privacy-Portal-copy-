using FluentValidation;
using Libs.Auth;
using Libs.Cors;
using Libs.HealthCheck;
using Libs.Logging;
using Libs.Mapster;
using Libs.ProblemDetails;
using Libs.Swagger;
using Libs.Tracing;
using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Libs.Audit;
using Libs.Utils;

namespace Complaints.Extensions.Infrastructure
{
    public static class InfrastructureExtensions
    {
        public static WebApplicationBuilder AddInfrastructure(this WebApplicationBuilder builder, string defaultFrontEndUri)
        {
            var configuration = builder.Configuration;
            var env = builder.Environment;
            string origin = builder.Configuration.GetValue<string>("PrivacyPortalOrigin")!;

            builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
            });

            builder.Services.AddCustomVersioning();
            builder.AddCustomSerilog();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddCustomSwagger(configuration, typeof(ComplaintsRoot).Assembly);
            builder.Services.AddCustomMediatR();
            builder.Services.AddValidatorsFromAssembly(typeof(ComplaintsRoot).Assembly);
            builder.Services.AddProblemDetails();
            builder.Services.AddCustomMapster(typeof(ComplaintsRoot).Assembly);
            builder.Services.AddCustomOpenTelemetry();
            builder.Services.AddCosmosDb(configuration);
            builder.Services.AddBlobServiceClient(configuration);
            builder.Services.AddRepositories();
            builder.Services.AddAuditLogService();
            builder.Services.AddCustomHealthCheck();

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.WithOrigins(origin)
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials()
                            .WithExposedHeaders("Location");
                });
            });

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
            app.UseCustomHealthCheck();
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