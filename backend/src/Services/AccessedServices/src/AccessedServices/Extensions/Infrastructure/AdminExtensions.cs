using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data;
using AccessedServices.Data.AccessLogApiResponseMock;
using AccessedServices.Data.Publish;
using Azure.Identity;
using Libs.Audit;
using Libs.Data;
using Libs.Web;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AccessedServices.Extensions.Infrastructure
{
    public static class AdminExtensions
    {
        private static bool ValidateSettings(AdminPublishSettings settings)
        {
            if (settings == null)
            {
                return false;
            }
            if (settings.UseIdentity)
            {
                if (string.IsNullOrWhiteSpace(settings.ClientId))
                {
                    return false;
                }
                else if (string.IsNullOrWhiteSpace(settings.DevAccountKey) ||
                    string.IsNullOrWhiteSpace(settings.UatAccountKey) ||
                    string.IsNullOrWhiteSpace(settings.ProdAccountKey))
                {
                    return false;
                }
            }
            if (string.IsNullOrWhiteSpace(settings.DevAccountEndpointUrl) ||
                string.IsNullOrWhiteSpace(settings.DevPreviewTable) ||
                string.IsNullOrWhiteSpace(settings.DevServiceTable) ||
                string.IsNullOrWhiteSpace(settings.UatAccountEndpointUrl) ||
                string.IsNullOrWhiteSpace(settings.UatPreviewTable) ||
                string.IsNullOrWhiteSpace(settings.UatServiceTable) ||
                string.IsNullOrWhiteSpace(settings.ProdAccountEndpointUrl) ||
                string.IsNullOrWhiteSpace(settings.ProdPreviewTable) ||
                string.IsNullOrWhiteSpace(settings.ProdServiceTable)
                )
            {
                return false;
            }
            if (string.IsNullOrWhiteSpace(settings.DevRedisServer) ||
                string.IsNullOrWhiteSpace(settings.DevRedisPassword) ||
                string.IsNullOrWhiteSpace(settings.UatRedisServer) ||
                string.IsNullOrWhiteSpace(settings.UatRedisPassword) ||
                string.IsNullOrWhiteSpace(settings.ProdRedisServer) ||
                string.IsNullOrWhiteSpace(settings.ProdRedisPassword))
            {
                return false;
            }
            return true;
        }
        public static IServiceCollection AddAdminServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IAdminAuditLogService>(provider =>
            {
                var auditLogService = provider.GetRequiredService<IAuditLogService>();
                return new AdminAuditLogService(auditLogService);
            });
            var settings = services.GetOptions<AdminPublishSettings>("PublishSettings");
            services.AddSingleton<IPublishWorkflowManager>(provider =>
            {
                var repo = provider.GetRequiredService<IPublishWorkflowRepository>();
                return new PublishWorkflowManager(repo);
            });
            if (ValidateSettings(settings))
            {
                services.AddKeyedSingleton<IPublishEnvironment>(PublishEnvironment.DEV, (provider, key) =>
                {
                    var client = settings.UseIdentity ?
                    new CosmosClient(settings.DevAccountEndpointUrl, new ManagedIdentityCredential(clientId: settings.ClientId),
                    new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    })
                    :
                    new CosmosClient(settings.DevAccountEndpointUrl, settings.DevAccountKey, new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    });
                    var previewRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.DevPreviewTable);
                    var serviceRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.DevServiceTable);
                    var mockEServiceRepo = new MockApiResponseEServiceRepository(provider, client, CosmosDbConfig.DatabaseName, PublishEnvironment.MOCK_TABLE);
                    var mockUIAMRepo = new MockApiResponseUIAMRepository(provider, client, CosmosDbConfig.DatabaseName, PublishEnvironment.MOCK_TABLE);
                    var config = new RedisConfig(settings.DevRedisServer, settings.DevRedisPassword);
                    return new DevPublishEnvironment(tag: PublishEnvironment.DEV,
                        previewRepo: previewRepo,
                        serviceRepo: serviceRepo,
                        mockEServiceRepo: mockEServiceRepo,
                        mockUIAMRepo: mockUIAMRepo,
                        client: new RedisClient(config)
                        );
                });
                services.AddKeyedSingleton<IPublishEnvironment>(PublishEnvironment.UAT, (provider, key) =>
                {
                    var client = settings.UseIdentity ?
                    new CosmosClient(settings.UatAccountEndpointUrl, new ManagedIdentityCredential(clientId: settings.ClientId),
                    new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    })
                    :
                    new CosmosClient(settings.UatAccountEndpointUrl, settings.UatAccountKey, new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    });
                    var previewRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.UatPreviewTable);
                    var serviceRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.UatServiceTable);
                    var config = new RedisConfig(settings.UatRedisServer, settings.UatRedisPassword);

                    return new PublishEnvironment(tag: PublishEnvironment.UAT,
                        previewRepo: previewRepo,
                        serviceRepo: serviceRepo,
                        redisClient: new RedisClient(config));
                });
                services.AddKeyedSingleton<IPublishEnvironment>(PublishEnvironment.PROD, (provider, key) =>
                {
                    var client = settings.UseIdentity ?
                    new CosmosClient(settings.ProdAccountEndpointUrl, new ManagedIdentityCredential(clientId: settings.ClientId),
                    new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    })
                    :
                    new CosmosClient(settings.ProdAccountEndpointUrl, settings.ProdAccountKey, new CosmosClientOptions()
                    {
                        ConnectionMode = ConnectionMode.Gateway,
                        SerializerOptions = new CosmosSerializationOptions()
                        {
                            PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                        }
                    });
                    var previewRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.ProdPreviewTable);
                    var serviceRepo = new ExternalServiceRepository(client, CosmosDbConfig.DatabaseName, settings.ProdServiceTable);
                    var config = new RedisConfig(settings.ProdRedisServer, settings.ProdRedisPassword);

                    return new PublishEnvironment(tag: PublishEnvironment.PROD,
                        previewRepo: previewRepo,
                        serviceRepo: serviceRepo,
                        redisClient: new RedisClient(config));
                });

                services.AddSingleton<IPublishService>(provider =>
                {
                    var draftRepo = provider.GetRequiredService<IDraftServiceRepository>();
                    var adminAuditLogService = provider.GetRequiredService<IAdminAuditLogService>();
                    var logger = provider.GetRequiredService<ILogger<PublishService>>();

                    return new PublishService(provider, draftRepo, adminAuditLogService, logger);
                });
            }
            else
            {
                services.AddSingleton<IPublishService>(provider =>
                {
                    return new DummyPublishService();
                });
            }
            return services;
        }
    }
}
