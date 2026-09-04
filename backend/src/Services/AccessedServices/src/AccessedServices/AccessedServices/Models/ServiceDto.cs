using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public class ServiceDto
    {
        public required string Id { get; set; }
        public required string ServiceName { get; set; }
        public bool IsAvailable { get; set; }
        public bool HasServiceDetails { get; set; }
    }
}
