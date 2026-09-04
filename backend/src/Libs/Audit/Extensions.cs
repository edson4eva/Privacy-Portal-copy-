using Azure.Identity;
using Libs.Data;
using Libs.Web;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public static class Extensions
    {
        public static IServiceCollection AddAuditLogService(this IServiceCollection services)
        {
            services.AddSingleton(serviceProvider =>
            {
                var auditLogOptions = services.GetOptions<AuditLogOptions>("AuditLogOptions");
                if (auditLogOptions == null)
                {
                    throw new InvalidOperationException("AuditLogOptions is not provided");
                }
                if (auditLogOptions.UseIdentity)
                {
                    if (string.IsNullOrWhiteSpace(auditLogOptions.Endpoint))
                    {
                        throw new InvalidOperationException("AuditLogOptions.Endpoint is not provided");
                    }
                    if (string.IsNullOrWhiteSpace(auditLogOptions.ClientId))
                    {
                        throw new InvalidOperationException("AuditLogOptions.ClientId is not provided");
                    }
                    return new AuditLogCosmosClient(auditLogOptions.Endpoint,
                        new ManagedIdentityCredential(clientId: auditLogOptions.ClientId),
                        new CosmosClientOptions()
                        {
                            ConnectionMode = ConnectionMode.Gateway,
                            SerializerOptions = new CosmosSerializationOptions()
                            {
                                PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                            }
                        });
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(auditLogOptions.ConnectionString))
                    {
                        throw new InvalidOperationException("AuditLogOptions.ConnectionString is not provided");
                    }
                    return new AuditLogCosmosClient(auditLogOptions.ConnectionString, new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    });
                }
            });
            services.AddHostedService(provider =>
            {
                var auditLogCosmosClient = provider.GetRequiredService<AuditLogCosmosClient>();
                var auditLogCosmosDbInitializer = new AuditLogCosmosDbInitializer(auditLogCosmosClient);
                return auditLogCosmosDbInitializer;
            });
            services.AddSingleton<IAuditLogRepository, AuditLogRepository>();
            services.AddSingleton<IAuditLogService, AuditLogService>();
            return services;
        }
    }
}
