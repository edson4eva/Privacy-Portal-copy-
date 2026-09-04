using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data
{
    public class AdminPublishSettings
    {
        public bool UseIdentity { get; set; }
        public string ClientId { get; set; }
        public string DevAccountEndpointUrl { get; set; }
        public string DevPreviewTable { get; set; }
        public string DevServiceTable { get; set; }
        public string UatAccountEndpointUrl { get; set; }
        public string UatPreviewTable { get; set; }
        public string UatServiceTable { get; set; }
        public string ProdAccountEndpointUrl { get; set; }
        public string ProdPreviewTable { get; set; }
        public string ProdServiceTable { get; set; }
        public string DevAccountKey { get; set; }
        public string UatAccountKey { get; set; }
        public string ProdAccountKey { get; set; }
        public string DevRedisServer { get; set; }
        public string DevRedisPassword { get; set; }
        public string UatRedisServer { get; set; }
        public string UatRedisPassword { get; set; }
        public string ProdRedisServer { get; set; }
        public string ProdRedisPassword { get; set; }
    }
}
