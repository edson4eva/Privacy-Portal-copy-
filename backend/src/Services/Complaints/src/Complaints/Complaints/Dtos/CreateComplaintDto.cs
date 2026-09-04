namespace Complaints.Complaints.Dtos
{
    public record CreateComplaintDto
    {
        public required string Department { get; set; }

        public string? Service { get; set; }

        public required string Concern { get; set; }

        public required string Circumstances { get; set; }

        public string? EmployeeName { get; set; }

        public required ComplaineeContactInfoDto ComplaineeContactInfo { get; set; }

        public required List<DocumentDto> Documents { get; set; }
    }
}
