using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Hosting;

namespace Libs.Data
{
    
    public class CosmosDbInitializer : IHostedService
    {
        private readonly CosmosClient _cosmosClient;
        private string _databaseName;
        private ContainerProperties[] _cosmosContainers;
        private IDataSeeder? _dataSeeder;

        public CosmosDbInitializer(CosmosClient cosmosClient, string databaseName, ContainerProperties[] cosmosContainers, IDataSeeder? dataSeeder = null)
        {
            _cosmosClient = cosmosClient;
            _databaseName = databaseName;
            _cosmosContainers = cosmosContainers;
            _dataSeeder = dataSeeder;
        }

        private async Task InitializeDatabaseAsync()
        {
            var database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_databaseName);
            

            foreach (var container in _cosmosContainers)
            {
                await database.Database.CreateContainerIfNotExistsAsync(container);
            }
            if(_dataSeeder!=null) await _dataSeeder.SeedAsync();
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await InitializeDatabaseAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }

}
