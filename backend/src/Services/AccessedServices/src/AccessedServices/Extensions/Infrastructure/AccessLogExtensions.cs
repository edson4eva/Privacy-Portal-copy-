using AccessedServices.AccessedServices.Services;
using AccessedServices.Shared.AppSettingOptions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace AccessedServices.Extensions.Infrastructure
{
    public static class AccessLogExtensions
    {
        public static IServiceCollection AddAccessLogService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IValidateOptions<StateStoreOptions>, StateStoreOptionsValidator>();
            services.AddOptions<StateStoreOptions>()
                .Bind(configuration.GetSection("StateStoreOptions"))
                .ValidateOnStart();
            services.AddScoped<IAccessLogService, AccessLogService>();
            return services;
        }
    }
    internal class StateStoreOptionsValidator : IValidateOptions<StateStoreOptions>
    {
        public ValidateOptionsResult Validate(string? name, StateStoreOptions options)
        {
            var failures = new List<string>();

            if (string.IsNullOrWhiteSpace(options.StoreName))
                failures.Add("StoreName must not be empty.");

            if (options.EServicesCacheTTLInSeconds <= 0)
                failures.Add("EServicesCacheTTLInSeconds must be greater than 0.");

            if (options.EServicesCacheStaleAfterSeconds <= 0)
                failures.Add("EServicesCacheStaleAfterSeconds must be greater than 0.");

            if (options.UIAMCacheTTLInSeconds <= 0)
                failures.Add("UIAMCacheTTLInSeconds must be greater than 0.");

            if (options.UIAMCacheStaleAfterSeconds <= 0)
                failures.Add("UIAMCacheStaleAfterSeconds must be greater than 0.");

            if (failures.Any())
                return ValidateOptionsResult.Fail(failures);

            return ValidateOptionsResult.Success;
        }
    }
}