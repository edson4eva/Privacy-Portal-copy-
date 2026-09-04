using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

using Refit;

namespace AccessedServices.Extensions.Infrastructure
{
    public static class RefitExtensions
    {
        public static IServiceCollection AddCustomRefit(this IServiceCollection services, IConfiguration configuration)
        {
            var builder = services.AddRefitClient<AccessedServices.Features.EServicesDataApi.V1.IEServicesDataApi>().ConfigureHttpClient(httpClient =>
            {
                string endpoint = configuration.GetValue<string>("AccessedServicesOptions:EServiceOptions:ApiEndpoint")!;
                httpClient.BaseAddress = new Uri(endpoint);
            });

            builder.AddHttpMessageHandler(serviceProvider => new HttpLoggingHandler(serviceProvider.GetRequiredService<ILogger<HttpLoggingHandler>>()));
            builder.Services.AddSingleton<HttpLoggingHandler>();

            return services;
        }
    }
}
