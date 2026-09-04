using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data.Publish
{
    public class RedisConfig(string host, string password, int port=6380)
    {
        public string GetConnectionString()
        {
            return $"{host}:{port},password={password},ssl=True";
        }
        public string GetHost()
        {
            return host;
        }
        public int GetPort()
        {
            return port;
        }
    }
}
