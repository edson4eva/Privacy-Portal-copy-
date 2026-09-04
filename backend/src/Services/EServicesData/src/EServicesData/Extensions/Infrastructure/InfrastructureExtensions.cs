using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Libs.Swagger;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Libs.Logging;
using Libs.Auth;
using Libs.Cors;
using Serilog;
using EServicesData.EServicesData.Features.GettingEServicesData.V1;
using Microsoft.Extensions.Configuration;
using Refit;
using Microsoft.Extensions.Logging;
using System.Text;

namespace EServicesData.Extensions.Infrastructure
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

            builder.Services.AddCustomVersioning();
            builder.AddCustomSerilog();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddCustomSwagger(configuration, typeof(EServicesDataRoot).Assembly);
            builder.Services.AddCustomMediatR();
            builder.Services.AddCors(configuration);

            //IHttpClientBuilder refitClientBuilder = builder.Services.AddRefitClient<IEServicesDataApi>().ConfigureHttpClient(httpClient =>
            //{
            //    string endpoint = configuration.GetValue<string>("EServices:ApiEndpoint")!;
            //    httpClient.BaseAddress = new Uri(endpoint);
            //});

            //refitClientBuilder.AddHttpMessageHandler(serviceProvider => new HttpLoggingHandler(serviceProvider.GetRequiredService<ILogger<HttpLoggingHandler>>()));
            //refitClientBuilder.Services.AddSingleton<HttpLoggingHandler>();

            return builder;
        }

        public static WebApplication UseInfrastructure(this WebApplication app)
        {
            var env = app.Environment;
            var appOptions = app.GetOptions<AppOptions>(nameof(AppOptions));
            app.UseSerilogRequestLogging(options =>
            {
                options.EnrichDiagnosticContext = LogEnrichHelper.EnrichFromRequest;
            });
            app.UseCorrelationId();
            app.MapGet("/", x => x.Response.WriteAsync(appOptions.Name));

            if (env.IsDevelopment())
            {
                app.UseCustomSwagger();
            }
            app.UseCors();
            return app;
        }

        public class HttpLoggingHandler(ILogger<HttpLoggingHandler> logger) : DelegatingHandler
        {
            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Guid id = Guid.NewGuid();

                HttpResponseMessage response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);

                logger.LogInformation("[{Id}] Request: {Request}", id, request);
                logger.LogInformation("[{Id}] Response: {Response}", id, response);

                return response;
            }
        }
    }
}
