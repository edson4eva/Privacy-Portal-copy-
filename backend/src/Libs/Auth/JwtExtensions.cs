using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Net;

namespace Libs.Auth
{
    public static class JwtExtensions
    {
        public static IServiceCollection AddJwt(this IServiceCollection services, IConfiguration configuration)
        {
            var keycloakSettings = configuration.GetSection("Keycloak").Get<KeycloakSettings>();
            if (keycloakSettings == null) throw new InvalidOperationException("Keycloak settings are missing");
            ValidateKeycloakSettings(keycloakSettings);
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
             .AddJwtBearer(options =>
             {
                 options.Authority = $"{keycloakSettings.BaseUrl}/auth/realms/{keycloakSettings.Realm}";
                 options.Audience = keycloakSettings.ClientId;
                 options.RequireHttpsMetadata = keycloakSettings.RequireHttpsMetadata;
                 options.TokenValidationParameters = new TokenValidationParameters
                 {
                     ValidateIssuer = true,
                     ValidateAudience = false,//TODO: true
                     ValidateLifetime = true,
                     ValidateIssuerSigningKey = true,
                     //ValidAudience = "account",//TODO:
                     ValidAlgorithms = [SecurityAlgorithms.RsaSha256]
                 };
                 options.Events = new JwtBearerEvents
                 {
                     OnAuthenticationFailed = context =>
                     {
                         // TODO: Log authentication failure
                         return Task.CompletedTask;
                     },
                     OnChallenge = context =>
                     {
                         context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                         context.HandleResponse();
                         return Task.CompletedTask;
                     }
                 };
             });
            services.AddAuthorization();
            return services;
        }
        private static void ValidateKeycloakSettings(KeycloakSettings settings)
        {
            if (string.IsNullOrWhiteSpace(settings.BaseUrl))
                throw new InvalidOperationException("Keycloak BaseUrl is missing");

            if (string.IsNullOrWhiteSpace(settings.Realm))
                throw new InvalidOperationException("Keycloak Realm is missing");

            if (string.IsNullOrWhiteSpace(settings.ClientId))
                throw new InvalidOperationException("Keycloak ClientId is missing");
        }
    }
}
