using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Net.NetworkInformation;
using System.Threading.Tasks;

namespace CosmosDBMigrationTool
{
    internal class MigrationService : IMigrationService
    {
        public async Task RunMigrationAsync(CosmosConfig _cosmosConfig)
        {
            CosmosClient sourceClient = new CosmosClient(_cosmosConfig.SourceCosmos.Endpoint, _cosmosConfig.SourceCosmos.Key,
                new CosmosClientOptions()
                {
                    ConnectionMode = ConnectionMode.Gateway,
                    SerializerOptions = new CosmosSerializationOptions()
                    {
                        PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                    }
                });
            CosmosClient destinationClient = new CosmosClient(_cosmosConfig.DestinationCosmos.Endpoint, _cosmosConfig.DestinationCosmos.Key,
                new CosmosClientOptions()
                {
                    ConnectionMode = ConnectionMode.Gateway,
                    SerializerOptions = new CosmosSerializationOptions()
                    {
                        PropertyNamingPolicy = CosmosPropertyNamingPolicy.CamelCase
                    }
                });

            Container sourceContainer = sourceClient.GetContainer(_cosmosConfig.SourceCosmos.DatabaseName, _cosmosConfig.SourceCosmos.ContainerName);
            Container destinationContainer = destinationClient.GetContainer(_cosmosConfig.DestinationCosmos.DatabaseName, _cosmosConfig.DestinationCosmos.ContainerName);

            Console.WriteLine("Fetching data from source...");
            List<dynamic> items = await FetchItemsFromSource(sourceContainer);

            Console.WriteLine("Copying data to destination...");
            await CopyDataToDestination(destinationContainer, items);
            Console.WriteLine("Migration completed successfully.");
        }
        private string GetMachineId()
        {
            string macAddress = string.Empty;

            foreach (NetworkInterface netInterface in NetworkInterface.GetAllNetworkInterfaces())
            {
                if (netInterface.OperationalStatus == OperationalStatus.Up)
                {
                    macAddress = BitConverter.ToString(netInterface.GetPhysicalAddress().GetAddressBytes());
                    break;
                }
            }

            return macAddress;
        }
        private string GetMachineInfo()
        {
            string machineName = Environment.MachineName;
            string osVersion = Environment.OSVersion.ToString();
            string userName = Environment.UserName;

            return $"Machine: {machineName}, OS: {osVersion}, User: {userName}";
        }
        private string GetLocalIpAddress()
        {
            string localIpAddress = string.Empty;

            foreach (var networkInterface in NetworkInterface.GetAllNetworkInterfaces())
            {
                var ipProperties = networkInterface.GetIPProperties();
               
                foreach (var unicastAddress in ipProperties.UnicastAddresses)
                {
                    if (unicastAddress.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    {
                        localIpAddress = unicastAddress.Address.ToString();
                        return localIpAddress;
                    }
                }
            }

            return localIpAddress;
        }
        private dynamic EnrichWithLog(dynamic item)
        {
            if (item is JObject jObject)
            {
                var enrichedItem = new JObject(jObject);

                var copyLog = new Dictionary<string, object>
                {
                    { "original_etag", item["_etag"] },
                    { "ip_address", GetLocalIpAddress() },
                    { "machine_id",GetMachineId() },
                    { "machine_info",GetMachineInfo() }
                };

                enrichedItem["copy_log"] = JObject.FromObject(copyLog);
                return enrichedItem;
            }

            return item;
        }
        private async Task<List<dynamic>> FetchItemsFromSource(Container sourceContainer)
        {
            var items = new List<dynamic>();

            var query = sourceContainer.GetItemQueryIterator<dynamic>("SELECT * FROM c");

            while (query.HasMoreResults)
            {
                FeedResponse<dynamic> response = await query.ReadNextAsync();
                foreach (var item in response)
                {
                    items.Add(EnrichWithLog(item));
                }
            }

            return items;
        }
        private async Task CopyDataToDestination(Container destinationContainer, List<dynamic> items)
        {
            foreach (var item in items)
            {
                try
                {
                    await destinationContainer.UpsertItemAsync(item);
                }
                catch (CosmosException ex)
                {
                    Console.WriteLine($"Error copying item: {ex.Message}");
                }
            }
        }
    }
}
