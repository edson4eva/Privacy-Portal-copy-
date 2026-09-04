using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Shared.AppSettingOptions
{
    public class StartupOptions
    {
        public bool SeedDatabase { get; set; }
    }
    public class StateStoreOptions
    {
        public required string StoreName { get; set; }
        public int EServicesCacheTTLInSeconds { get; set; }
        public int EServicesCacheStaleAfterSeconds { get; set; }
        public int UIAMCacheTTLInSeconds { get; set; }
        public int UIAMCacheStaleAfterSeconds { get; set; }
    }
}
