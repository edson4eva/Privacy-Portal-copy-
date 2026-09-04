using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Libs.Data;
using Libs.Web;
using AccessedServices.Data;
using AccessedServices.Data.AccessLogApiResponseMock;
using AccessedServices.Data.Publish;
using Microsoft.AspNetCore.Http;
using Azure.Identity;
using Libs.Audit;

namespace AccessedServices.Extensions.Infrastructure
{
    public static class CosmosDbExtensions
    {
        public static IServiceCollection AddCosmosDb(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<CosmosClient>(serviceProvider =>
            {
                var cosmosOptions = services.GetOptions<CosmosOptions>("CosmosOptions");
                if (cosmosOptions == null)
                {
                    throw new InvalidOperationException("CosmosOption is not provided");
                }
                if (cosmosOptions.UseIdentity)
                {
                    if (string.IsNullOrWhiteSpace(cosmosOptions.Endpoint))
                    {
                        throw new InvalidOperationException("CosmosOption.Endpoint is not provided");
                    }
                    if (string.IsNullOrWhiteSpace(cosmosOptions.ClientId))
                    {
                        throw new InvalidOperationException("CosmosOption.ClientId is not provided");
                    }
                    return new CosmosClient(cosmosOptions.Endpoint,
                        new ManagedIdentityCredential(clientId: cosmosOptions.ClientId),
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
                    if (string.IsNullOrWhiteSpace(cosmosOptions.ConnectionString))
                    {
                        throw new InvalidOperationException("CosmosOptions.ConnectionString is not provided");
                    }
                    return new CosmosClient(cosmosOptions.ConnectionString, new CosmosClientOptions()
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
                var seedDatabse = services.GetOptions<Shared.AppSettingOptions.StartupOptions>("StartupOptions").SeedDatabase;
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var cosmosDbInitializer = new CosmosDbInitializer(cosmosClient, CosmosDbConfig.DatabaseName, [
                    CosmosDbConfig.ServicesContainer,
                    CosmosDbConfig.ServicesPreviewContainer,
                    CosmosDbConfig.AccessLogApiResponseMock,
                    CosmosDbConfig.AdminUsersContainer,
                    CosmosDbConfig.PublishWorkflowContainer,
                    CosmosDbConfig.ServicesDataContainer,
                    CosmosDbConfig.DraftServicesDataContainer,
                    ], new DataSeeder(cosmosClient, seedDatabse));
                return cosmosDbInitializer;
            });

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IServiceRepository>(provider =>
            {
                var httpContext = provider.GetRequiredService<IHttpContextAccessor>().HttpContext;
                var isPreview = httpContext.IsPreviewMode();

                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = isPreview ? CosmosDbConfig.ServicesPreviewContainer.Id : CosmosDbConfig.ServicesContainer.Id;

                return new ServiceRepository(cosmosClient, databaseId, containerId);
            });

            services.AddSingleton<IMockApiResponseEServiceRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.AccessLogApiResponseMock.Id;

                return new MockApiResponseEServiceRepository(provider, cosmosClient, databaseId, containerId);
            });

            services.AddSingleton<IMockApiResponseUIAMRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.AccessLogApiResponseMock.Id;

                return new MockApiResponseUIAMRepository(provider, cosmosClient, databaseId, containerId);
            });

            services.AddSingleton<IAdminUserRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.AdminUsersContainer.Id;

                return new AdminUserRepository(cosmosClient, databaseId, containerId);
            });
            services.AddSingleton<IDraftServiceRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.DraftServicesDataContainer.Id;

                return new DraftServiceRepository(cosmosClient, databaseId, containerId);
            });
            services.AddSingleton<IPublishWorkflowRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.PublishWorkflowContainer.Id;

                return new PublishWorkflowRepository(cosmosClient, databaseId, containerId);
            });

            services.AddScoped<Data.AccessLogApiResponseMock.UserAccessedServicesRepository>();
            services.AddScoped<Data.Mock.UserAccessedServicesRepository>();
            services.AddScoped<Data.UserAccessedServicesRepository>();
            services.AddScoped<IUserAccessedServicesRepository>(provider =>
            {
                var accessedServicesOptions = services.GetOptions<AccessedServicesOptions>("AccessedServicesOptions");
                if (accessedServicesOptions == null)
                    throw new InvalidOperationException("AccessedServicesOptions is not provided");

                var httpContext = provider.GetRequiredService<IHttpContextAccessor>().HttpContext;
                var isPreview = httpContext.IsPreviewMode();

                if (accessedServicesOptions.UseMock || isPreview)
                {
                    if (accessedServicesOptions.MockDataSource == "DB" || isPreview)
                    {
                        return provider.GetRequiredService<Data.AccessLogApiResponseMock.UserAccessedServicesRepository>();
                    }
                    else
                    {
                        return provider.GetRequiredService<Data.Mock.UserAccessedServicesRepository>();
                    }
                }
                else
                {
                    return provider.GetRequiredService<Data.UserAccessedServicesRepository>();
                }
            });

            return services;

        }
    }
}
