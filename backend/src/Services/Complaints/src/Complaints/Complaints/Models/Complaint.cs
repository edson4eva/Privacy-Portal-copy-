using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.Complaints.Models
{
    public class Complaint
    {
        public required string Id { get; set; }
        
        public required string UserId { get; set; } = "guest";
        
        public required bool IsUserGuest { get; set; }
        
        public required string RecaptchaId { get; set; }
        
        /// <summary>
        /// This code should match one of the predefined department codes as defined in the <see cref="DepartmentCodes"/> class.
        /// </summary>
        public required string Department { get; set; }
        
        public string? Service { get; set; }

        public required string Concern { get; set; }

        public required string Circumstances { get; set; }
        
        public string? EmployeeName { get; set; }
        
        public required ComplaineeContactInfo ComplaineeContactInfo { get; set; }
        
        public required List<Document>? Documents { get; set; }
        
        public required string ComplaintId { get; set; }

        public required DateTime CreatedDate { get; set; }
    }
}
