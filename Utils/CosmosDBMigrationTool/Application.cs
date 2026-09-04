using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace CosmosDBMigrationTool
{
    public class Application
    {
        private readonly IConfiguration _configuration;
        private readonly IMigrationService _migrationService;

        private readonly CosmosConfig _cosmosConfig;
        public Application(IConfiguration configuration, IMigrationService migrationService)
        {
            _configuration = configuration;
            _migrationService = migrationService;

            _cosmosConfig = GetCosmosConfiguration();            
        }
        public async Task Run()
        {
            DisplayCurrentConfiguration();

            if (GetUserConfirmation("Do you want to proceed with the migration?"))
            {
                await _migrationService.RunMigrationAsync(_cosmosConfig);
            }
            else
            {
                Console.WriteLine("Migration cancelled.");
            }

            Console.WriteLine("\n=============================================================\n");

            RemoveSensitiveKeys();

            Console.WriteLine("\nPress Enter to exit.");
            Console.ReadLine();
        }

        private void RemoveSensitiveKeys()
        {
            if(GetUserConfirmation("Would you like to remove the sensitive Cosmos DB keys from your appsettings.json?"))
            {
                var filePath = $"{AppDomain.CurrentDomain.BaseDirectory}appsettings.json";
                if (File.Exists(filePath))
                {
                    var jsonObject = JObject.Parse(File.ReadAllText(filePath));
                    var cosmosConfigSectionObject = jsonObject["CosmosConfig"];

                    foreach (var section in new[] { "SourceCosmos", "DestinationCosmos" })
                    {
                        var sectionObject = cosmosConfigSectionObject?[section];
                        if (sectionObject != null && sectionObject["Key"] != null)
                        {
                            sectionObject["Key"] = string.Empty;
                        }
                    }
                    File.WriteAllText(filePath, jsonObject.ToString());
                }
                else
                {
                    Console.WriteLine("appsettings.json not found.");
                }
                Console.WriteLine("The sensitive Cosmos DB keys have been successfully removed from your appsettings.json.");
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("WARNING: THE SENSITIVE KEYS WERE NOT REMOVED. PLEASE ENSURE THAT THESE KEYS ARE KEPT SECURE AND PROTECTED FROM UNAUTHORIZED ACCESS!");
                Console.ResetColor();
            }
        }

        private CosmosConfig GetCosmosConfiguration()
        {
            var cosmosConfig = _configuration.GetSection("CosmosConfig").Get<CosmosConfig>();
            if (cosmosConfig == null)
                throw new InvalidOperationException("CosmosConfig is not available in appsettings.json");
            cosmosConfig.Validate();
            return cosmosConfig;
        }
        private void DisplayCurrentConfiguration()
        {
            Console.WriteLine("Current Configuration:");
            Console.WriteLine("----------------------\n");

            PrintConfig("Source Cosmos DB Endpoint:", _cosmosConfig.SourceCosmos.Endpoint, ConsoleColor.Cyan);
            PrintConfig("Source Database Name:", _cosmosConfig.SourceCosmos.DatabaseName, ConsoleColor.Green);
            PrintConfig("Source Container Name:", _cosmosConfig.SourceCosmos.ContainerName, ConsoleColor.Yellow);

            Console.WriteLine("\n");

            PrintConfig("Destination Cosmos DB Endpoint:", _cosmosConfig.DestinationCosmos.Endpoint, ConsoleColor.Cyan);
            PrintConfig("Destination Database Name:", _cosmosConfig.DestinationCosmos.DatabaseName, ConsoleColor.Green);
            PrintConfig("Destination Container Name:", _cosmosConfig.DestinationCosmos.ContainerName, ConsoleColor.Yellow);

            Console.WriteLine("\n******************************************************************\n");
        }
        private void PrintConfig(string label, string value, ConsoleColor color)
        {
            Console.Write(label);
            Console.ForegroundColor = color;
            Console.WriteLine($" {value}");
            Console.ResetColor();
        }
        private bool GetUserConfirmation(string question)
        {
            Console.WriteLine($"{question} (Y/N)");
            var userInput = Console.ReadLine()?.ToUpper();
            return userInput == "Y";
        }
    }
}
