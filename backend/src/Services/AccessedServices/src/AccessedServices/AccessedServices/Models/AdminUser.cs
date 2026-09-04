using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public class AdminUser
    {
        public required string Id { get; set; }
        public required bool IsActive { get; set; }
    }
}
