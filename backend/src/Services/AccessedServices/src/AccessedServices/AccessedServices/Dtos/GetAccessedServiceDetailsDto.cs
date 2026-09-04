using AccessedServices.AccessedServices.Models;
namespace AccessedServices.AccessedServices.Dtos
{
    public class GetAccessedServiceDetailsDto
    {
        public DateTime[]? AccessedDates { get; set; }
        public ServiceDetailDto? ServiceDetails { get; set; }
    }
}
