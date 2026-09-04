using Libs.Data;
using Microsoft.Azure.Cosmos;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.Data
{
    public class ServiceRepository : BaseRepository<Service>, IServiceRepository
    {
        public ServiceRepository(CosmosClient cosmosClient, string databaseId, string containerId)
            : base(cosmosClient, databaseId, containerId) { }
    }
}
