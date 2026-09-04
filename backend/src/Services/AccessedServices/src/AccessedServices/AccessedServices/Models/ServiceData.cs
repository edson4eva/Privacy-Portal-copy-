namespace AccessedServices.AccessedServices.Models
{    
    public class ServiceDataSection
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
    }
    public class ServiceData
    {
        public required string Id { get; set; }
        public required string Description { get; set; }
        public string? AccessServiceUrl { get; set; }
        public List<ServiceDataSection>? Sections { get; set; }
    }
}
