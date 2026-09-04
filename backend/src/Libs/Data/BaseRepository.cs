using System.ComponentModel;
using Grpc.Net.Client.Balancer;
using Microsoft.Azure.Cosmos;

namespace Libs.Data
{
    public abstract class BaseRepository<T> : IBaseRepository<T> where T : class
    {
        protected readonly Microsoft.Azure.Cosmos.Container _container;

        protected BaseRepository(CosmosClient cosmosClient, string databaseId, string containerId)
        {
            _container = cosmosClient.GetContainer(databaseId, containerId);
        }
        protected async Task<IEnumerable<T>> GetAllAsync(QueryDefinition queryDef)
        {
            var iterator = _container.GetItemQueryIterator<T>(queryDef);
            List<T> results = new List<T>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
        protected async Task<IEnumerable<T>> GetAllAsync(string query)
        {
            var queryDef = new QueryDefinition(query);
            return await GetAllAsync(queryDef);
        }

        public virtual async Task AddAsync(T item, PartitionKey partitionKey)
        {
            await _container.CreateItemAsync(item, partitionKey);
        }

        public virtual async Task<T?> GetByIdAsync(string id, PartitionKey partitionKey)
        {
            try
            {
                var response = await _container.ReadItemAsync<T>(id, partitionKey);
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            var query = "SELECT * FROM c";
            return await GetAllAsync(query);
        }

        public virtual async Task UpdateAsync(T item, PartitionKey partitionKey)
        {
            await _container.UpsertItemAsync(item, partitionKey);
        }

        public async Task<bool> DeleteAllAsync()
        {
            var query = new QueryDefinition("SELECT * FROM c");
            var iterator = _container.GetItemQueryIterator<dynamic>(query);

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                foreach (var item in response)
                {
                    string id = item.id;
                    PartitionKey partitionKey = new PartitionKey(id);
                    await _container.DeleteItemAsync<dynamic>(id, partitionKey);
                }
            }
            return true;            
        }
    }
}
