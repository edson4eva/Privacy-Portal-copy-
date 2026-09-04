using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public interface IService
    {
        public string Id { get; set; }
        public string ServiceName { get; set; }
        public string CategoryId { get; set; } //category
        public bool IsAvailable { get; set; }
        public bool ShowOnUI { get; set; }
        public string Origin { get; set; }
        public string? RPId { get; set; }
        public string? Sku { get; set; }
        public string? Description { get; set; } //description under the service name (AKA "about service" section), this is html content
        public string? DataOwnerId { get; set; } //ministry
        public string? AccessServiceUrl { get; set; }
        public List<ServiceDataSection>? Sections { get; set; } //accordion data
        public int? Version { get; set; }//for data feeder
        public bool ShowMockInDev { get; set; }
    }
}
