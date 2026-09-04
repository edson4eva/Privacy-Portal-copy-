using Complaints.Complaints.Models;

namespace Complaints.Complaints.Dtos
{
    public record GetComplaintDto
    {
        public required string Department {  get; set; }
        public string? Service { get; set; }
        public required string Concern { get; set; }
        public required string Circumstances { get; set; }
        public string? EmployeeName { get; set; }
        public required ComplaineeContactInfoDto ComplaineeContactInfo { get; set; }
        public required DocumentDto[] Documents { get; set; }
        public required string ComplaintId { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
