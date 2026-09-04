using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Exceptions;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace AccessedServices.Data.Publish
{
    public class RedisClient(RedisConfig config) : IRedisClient
    {
        public async Task FlushCache()
        {
            try
            {
                var connStr = config.GetConnectionString();
                var options = ConfigurationOptions.Parse(connStr);
                options.AllowAdmin = true;
                options.ClientName = "admin-panel";
                options.AbortOnConnectFail = false;
                options.AsyncTimeout = 8000;
                using var connection = await ConnectionMultiplexer.ConnectAsync(options);
                var server = connection.GetServer(config.GetHost(), config.GetPort());
                await server.FlushAllDatabasesAsync();
            }
            catch (Exception ex)
            {
                throw new FlushCacheException(config.GetHost(), ex.Message);
            }
        }
    }
}
