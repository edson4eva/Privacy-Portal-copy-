using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public static class Origin
    {
        public const string UIAM = "UIAM";
        public const string EServices = "eServices";
    }
    public class Service: IService
    {
        /// <summary>
        /// This should match one of the Ids as defined in the <see cref="Models.ServiceId"/> class.
        /// </summary>
        public required string Id { get; set; }
        public required string ServiceName { get; set; }
        public required string CategoryId { get; set; }
        public bool IsAvailable { get; set; }
        public bool ShowOnUI { get; set; }
        /// <summary>
        /// This should match one of the Origins as defined in the <see cref="Models.Origin"/> class.
        /// </summary>
        public required string Origin {  get; set; }
        public string? RPId { get; set; }
        public string? Sku { get; set; }
        public string? Description { get; set; } //description under the service name (AKA "about service" section), this is html content
        public string? DataOwnerId { get; set; } //ministry
        public List<string> DataOwnerIds { get; set; } = new List<string>(); //ministries
        public string? AccessServiceUrl { get; set; }
        public List<ServiceDataSection>? Sections { get; set; } //accordion data
        public int? Version { get; set; }//for data feeder
        public bool ShowMockInDev { get; set; }
    }
}
