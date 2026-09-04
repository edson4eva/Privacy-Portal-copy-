using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Libs.Tracing;
using HealthChecks.UI.Client;

namespace Libs.HealthCheck
{
    public static class Extensions
    {
        public static IServiceCollection AddCustomHealthCheck(this IServiceCollection services)
        {
            var healthChecksBuilder = services.AddHealthChecks()
                .AddCheck("liveness", () => HealthCheckResult.Healthy("The application is running"), tags:["liveness"])
                .AddAzureCosmosDB(tags: ["readiness"]);

            var azureMonitorOptions = services.GetOptions<AzureMonitorOptions>(nameof(AzureMonitorOptions));
            if (azureMonitorOptions is not null && !string.IsNullOrWhiteSpace(azureMonitorOptions.ConnectionString)
                && !string.IsNullOrWhiteSpace(azureMonitorOptions.InstrumentationKey))
            {
                healthChecksBuilder
                    .AddAzureApplicationInsights(azureMonitorOptions.InstrumentationKey, tags: ["readiness"]);
            }

            return services;
        }

        public static WebApplication UseCustomHealthCheck(this WebApplication app)
        {
            app.UseHealthChecks("/health/startup",
                new HealthCheckOptions
                {
                    Predicate = (check) => check.Tags.Contains("startup"),
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });
            app.UseHealthChecks("/health/readiness",
                new HealthCheckOptions
                {
                    Predicate = (check) => check.Tags.Contains("readiness"),
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });
            app.UseHealthChecks("/health/liveness",
                new HealthCheckOptions
                {
                    Predicate = (check) => check.Tags.Contains("liveness"),
                    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
                });

            return app;
        }
    }
}
