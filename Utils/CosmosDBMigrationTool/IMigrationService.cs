using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosmosDBMigrationTool
{
    public interface IMigrationService
    {
        Task RunMigrationAsync(CosmosConfig _cosmosConfig);
    }
}
