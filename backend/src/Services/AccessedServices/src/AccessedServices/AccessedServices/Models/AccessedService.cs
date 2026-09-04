using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public class AccessedServicesCacheResult
    {
        public DateTime CachedTimeUTC {  get; set; }
        public required IEnumerable<AccessedService> AccessedServices { get; set; }
    }
    public class AccessedServicesResult
    {
        public bool IsUIAMStale { get; set; }
        public bool IsEServiceStale { get; set; }
        public required IEnumerable<AccessedService> AccessedServices { get; set; }
    }
    public class AccessedService
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public required string Category { get; set; }
        public bool IsAvailable { get; set; }
        public required DateTime[] AccessedDates { get; set; }
        public IEnumerable<string>? ClaimAttributes { get; set; }
    }
}
