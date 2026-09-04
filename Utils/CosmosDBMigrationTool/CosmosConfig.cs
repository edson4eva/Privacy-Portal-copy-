using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosmosDBMigrationTool
{
    public class CosmosConfig
    {
        public required CosmosDbConfig SourceCosmos { get; set; }
        public required CosmosDbConfig DestinationCosmos { get; set; }
        public void Validate()
        {
            SourceCosmos?.Validate("Source");
            DestinationCosmos?.Validate("Destination");
        }
    }
    public class CosmosDbConfig
    {
        public required string Endpoint { get; set; }
        public required string Key { get; set; }
        public required string DatabaseName { get; set; }
        public required string ContainerName { get; set; }
        public void Validate(string cosmosType)
        {
            if (string.IsNullOrWhiteSpace(Endpoint))
                throw new InvalidOperationException($"{cosmosType} Cosmos configuration: Endpoint is missing or empty.");

            if (string.IsNullOrWhiteSpace(Key))
                throw new InvalidOperationException($"{cosmosType} Cosmos configuration: Key is missing or empty.");

            if (string.IsNullOrWhiteSpace(DatabaseName))
                throw new InvalidOperationException($"{cosmosType} Cosmos configuration: DatabaseName is missing or empty.");

            if (string.IsNullOrWhiteSpace(ContainerName))
                throw new InvalidOperationException($"{cosmosType} Cosmos configuration: ContainerName is missing or empty.");
        }
    }
}
