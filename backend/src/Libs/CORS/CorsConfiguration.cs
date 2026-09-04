using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Libs.Cors
{
    public static class CorsConfiguration
    {
        public static void AddCors(this IServiceCollection services, IConfiguration configuration)
        {
            string origin = configuration.GetValue<string>("PrivacyPortalOrigin")!;
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(origin)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithExposedHeaders("Location");
                });
            });
        }
    }
}
