using AccessedServices.AccessedServices.Features.Admin.V1;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Libs.Web;
using Mapster;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Serialization.HybridRow.Schemas;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using static Grpc.Core.Metadata;
using PartitionKey = Microsoft.Azure.Cosmos.PartitionKey;

namespace AccessedServices.Data
{
    public class DataSeeder : IDataSeeder
    {
        private readonly CosmosClient _cosmosClient;
        private readonly bool _seedDatabase;
        public DataSeeder(CosmosClient cosmosClient, bool seedDatabase)
        {
            _cosmosClient = cosmosClient;
            _seedDatabase = seedDatabase;
        }
        public async Task SeedAsync()
        {
            if (!_seedDatabase) return;
            await SeedServices();
        }

        private async Task SeedServices()
        {
            var serviceContainer = _cosmosClient.GetContainer(CosmosDbConfig.DatabaseName, CosmosDbConfig.ServicesContainer.Id);
            // Check if data already exists
            var query = "SELECT * FROM c";
            var iterator = serviceContainer.GetItemQueryIterator<Service>(query);
            var response = await iterator.ReadNextAsync();

            if (response.Count == 0)
            {
                foreach (var id in InitialServiceData.Items.Keys)
                {
                    await serviceContainer.CreateItemAsync(InitialServiceData.Items[id]);
                }
            }
        }
    }
}
