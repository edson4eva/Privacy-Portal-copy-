using Azure.Monitor.OpenTelemetry.Exporter;
using Libs.Web;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace Libs.Tracing
{
    public static class Extensions
    {
        public static IServiceCollection AddCustomOpenTelemetry(this IServiceCollection services)
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            var azureMonitorOptions = services.GetOptions<AzureMonitorOptions>("AzureMonitorOptions");
            if (environmentName == "Development") return services;
            if(azureMonitorOptions == null || string.IsNullOrWhiteSpace(azureMonitorOptions.ConnectionString))
            {
                throw new InvalidOperationException("AzureMonitorOptions.ConnectionString is not provided");
            }

            services.AddOpenTelemetry()
            .WithTracing(builder => builder
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .SetResourceBuilder(ResourceBuilder.CreateDefault()
                    .AddService(services.GetOptions<AppOptions>("AppOptions").Name))
                .AddAzureMonitorTraceExporter(o =>
                {
                    o.ConnectionString = azureMonitorOptions.ConnectionString;
                }))
            .WithMetrics(builder =>
            {
                builder.AddAzureMonitorMetricExporter(o =>
                {
                    o.ConnectionString = azureMonitorOptions.ConnectionString;
                });
                builder.AddMeter(
                    "Microsoft.AspNetCore.Hosting",
                    "Microsoft.AspNetCore.Server.Kestrel"
                );
                builder.AddView("request-duration",
                    new ExplicitBucketHistogramConfiguration
                    {
                        Boundaries = new[]
                        {
                            0, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10
                        }
                    });
            });
            return services;
        }
    }
}
