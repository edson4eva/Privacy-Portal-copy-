using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.Complaints.Models
{
    public class ComplaineeContactInfo
    {
        public required string FirstName {  get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
    }
}
