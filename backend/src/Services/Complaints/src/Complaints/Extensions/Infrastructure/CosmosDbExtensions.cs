using Azure.Identity;
using Complaints.Data;
using Libs.Data;
using Libs.Web;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Complaints.Extensions.Infrastructure
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
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var cosmosDbInitializer = new CosmosDbInitializer(cosmosClient, CosmosDbConfig.DatabaseName, [
                    CosmosDbConfig.ComplaintsContainer
                    ]);
                return cosmosDbInitializer;
            });

            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddSingleton<IComplaintRepository>(provider =>
            {
                var cosmosClient = provider.GetRequiredService<CosmosClient>();
                var databaseId = CosmosDbConfig.DatabaseName;
                var containerId = CosmosDbConfig.ComplaintsContainer.Id;

                return new ComplaintRepository(cosmosClient, databaseId, containerId);
            });

            return services;
        }
    }
}
