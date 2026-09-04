using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SpectreConsole;
using Serilog.Exceptions;
using Libs.Tracing;
using Serilog.Sinks.ApplicationInsights.TelemetryConverters;

namespace Libs.Logging
{
    public static class Extensions
    {
        public static WebApplicationBuilder AddCustomSerilog(this WebApplicationBuilder builder)
        {
            builder.Host.UseSerilog((context, services, loggerConfiguration) =>
            {
                var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var logOptions = context.Configuration.GetSection(nameof(LogOptions)).Get<LogOptions>();
                var appOptions = context.Configuration.GetSection(nameof(AppOptions)).Get<AppOptions>();
                var azureMonitorOptions = context.Configuration.GetSection(nameof(AzureMonitorOptions)).Get<AzureMonitorOptions>();

                var logLevel = Enum.TryParse<LogEventLevel>(logOptions?.Level, true, out var level)
                    ? level
                    : LogEventLevel.Information;
                var spectreLogTemplate = "{Timestamp:HH:mm:ss} [{Level:u4}] {Message:lj}{NewLine}{Exception}";

                loggerConfiguration
                    .MinimumLevel.Is(logLevel)
                    .WriteTo.SpectreConsole(spectreLogTemplate, logLevel)
                    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                    .Enrich.WithExceptionDetails()
                    .Enrich.FromLogContext()
                    .ReadFrom.Configuration(context.Configuration);
                if (environment != "Development" && azureMonitorOptions != null && !string.IsNullOrWhiteSpace(azureMonitorOptions.ConnectionString))
                {
                    loggerConfiguration
                        .WriteTo.ApplicationInsights(azureMonitorOptions.ConnectionString, new TraceTelemetryConverter());
                }
            });
            return builder;
        }
    }
}
