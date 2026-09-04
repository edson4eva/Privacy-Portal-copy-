namespace AccessedServices.AccessedServices.Dtos
{
    public class GetAccessedServiceDto
    {
        public required string Id { get; set; }
        public required string ServiceName { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime LastAccessedOn { get; set; }
        public required string CategoryId {  get; set; }
    }
}