using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace AccessedServices.Data.Publish
{
    public class ExternalServiceRepository : BaseRepository<Service>, IExternalServiceRepository
    {
        public ExternalServiceRepository(CosmosClient cosmosClient, string databaseId, string containerId)
            : base(cosmosClient, databaseId, containerId) { }

        public async Task DeleteAsync(string id, PartitionKey partitionKey)
        {
            await _container.DeleteItemAsync<Service>(id, partitionKey);
        }
    }
}
