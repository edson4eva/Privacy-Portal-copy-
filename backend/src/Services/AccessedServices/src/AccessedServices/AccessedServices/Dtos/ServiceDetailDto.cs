using AccessedServices.AccessedServices.Models;

namespace AccessedServices.AccessedServices.Dtos
{
    public class ServiceDetailDto
    {
        public string? Id { get; set; }
        public string? ServiceName { get; set; }
        public string? CategoryId { get; set; } //category
        public string? CategoryText { get; set; } //category
        public bool? IsAvailable { get; set; }
        public bool? ShowOnUI { get; set; }
        public string? Origin { get; set; }
        public string? RPId { get; set; }
        public string? RPIdForUAT { get; set; }
        public string? Sku { get; set; }
        public string? Description { get; set; } //description under the service name (AKA "about service" section)
        //public string? DataOwnerId { get; set; }
        //public string? DataOwnerText { get; set; }
        public List<string>? DataOwnerIds { get; set; } = new List<string>();
        public List<string>? DataOwnerTexts { get; set; } = new List<string>();
        public string? AccessServiceUrl { get; set; }
        public List<ServiceDataSection>? Sections { get; set; } //accordion data
        public bool? ShowMockInDev { get; set; }

        public List<string> CollectChanges(DraftService service)
        {
            var result = new List<string>();
            var name = service.ServiceName;

            if (ServiceName != null && service.ServiceName != ServiceName)
            {
                result.Add($"Service name changed to {ServiceName}");
                name = ServiceName;
            }
            if (ShowMockInDev != null && service.ShowMockInDev != ShowMockInDev)
            {
                result.Add($"{name} > Show mock in Dev environment - {ShowMockInDev}");
            }            
            if (IsAvailable != null && service.IsAvailable != IsAvailable)
            {
                result.Add($"{name} > Service details available - " + ((IsAvailable==true) ? "Yes" : "No"));
            }
            if (CategoryId != null && service.CategoryId != CategoryId)
            {
                result.Add($"{name} > Category");
            }
            if (Origin != null && service.Origin != Origin)
            {
                result.Add($"{name} > Service origin");
            }
            if (RPId != null && service.RPId != RPId)
            {
                result.Add($"{name} > Relying party ID PROD");
            }
            if (RPIdForUAT != null && service.RPIdForUAT != RPIdForUAT)
            {
                result.Add($"{name} > Relying party ID UAT");
            }
            if (Sku != null && service.Sku != Sku)
            {
                result.Add($"{name} > SKU");
            }
            if (Description != null && service.Description != Description)
            {
                result.Add($"{name} > Service description");
            }
            if (DataOwnerIds != null)
            {
                if (service.DataOwnerIds == null )
                {
                    result.Add($"{name} > Ministry and data owner");
                }
                else
                {
                    var common = service.DataOwnerIds.Intersect(DataOwnerIds).ToList();
                    if(common.Count != service.DataOwnerIds.Count || common.Count != DataOwnerIds.Count)
                    {
                        result.Add($"{name} > Ministry and data owner");
                    }
                }
            }
            if (AccessServiceUrl != null && service.AccessServiceUrl != AccessServiceUrl)
            {
                result.Add($"{name} > Service link");
            }
            return result;
        }
        public bool HasChanges(DraftService service)
        {
            if(ShowMockInDev!=null && service.ShowMockInDev != ShowMockInDev)
            {
                return true;
            }
            if(ServiceName!=null && service.ServiceName!=ServiceName)
            {
                return true;
            }
            if (IsAvailable != null && service.IsAvailable != IsAvailable)
            {
                return true;
            }
            if (ShowOnUI != null && service.ShowOnUI != ShowOnUI)
            {
                return true;
            }
            if (CategoryId != null && service.CategoryId != CategoryId)
            {
                return true;
            }
            if (Origin != null && service.Origin != Origin)
            {
                return true;
            }
            if (RPId != null && service.RPId != RPId)
            {
                return true;
            }
            if (RPIdForUAT != null && service.RPIdForUAT != RPIdForUAT)
            {
                return true;
            }
            if (Sku != null && service.Sku != Sku)
            {
                return true;
            }
            if (Description != null && service.Description != Description)
            {
                return true;
            }
            if (DataOwnerIds!= null)
            {
                if (service.DataOwnerIds == null)
                {
                    return true;
                }
                else
                {
                    var common = service.DataOwnerIds.Intersect(DataOwnerIds).ToList();
                    if (common.Count != service.DataOwnerIds.Count || common.Count != DataOwnerIds.Count)
                    {
                        return true;
                    }
                }
            }
            if (AccessServiceUrl != null && service.AccessServiceUrl != AccessServiceUrl)
            {
                return true;
            }
            return false;
        }
    }
}
