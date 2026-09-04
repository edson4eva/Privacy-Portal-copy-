using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public class UIAMData
    {
        public required string RpId { get; set; }
        public IEnumerable<string>? ClaimAttributes { get; set; }
        public required DateTime[] AccessedDates { get; set; }
    }
}
