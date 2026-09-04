using Libs.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public class AuditLogCosmosDbInitializer : IHostedService
    {
        private readonly AuditLogCosmosClient _cosmosClient;
        public AuditLogCosmosDbInitializer(AuditLogCosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        private async Task InitializeDatabaseAsync()
        {
            var database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(AuditLogCosmosDbConfig.DatabaseName);

            await database.Database.CreateContainerIfNotExistsAsync(AuditLogCosmosDbConfig.AuditLogContainer);
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            await InitializeDatabaseAsync();
        }

        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
