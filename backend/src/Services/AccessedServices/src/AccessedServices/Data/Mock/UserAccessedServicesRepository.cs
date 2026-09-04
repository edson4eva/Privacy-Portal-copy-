using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AccessedServices.Data.Mock
{
    #region EService Types
    internal class AccessedService
    {
        public required string Name { get; set; }
        public required string Sku { get; set; }
        public required DateTime[] AccessLogs { get; set; }
    }
    internal class EService
    {
        public required string UserId { get; set; }
        public required AccessedService[] AccessedServices { get; set; }
    }
    #endregion

    #region UIAM Data Types
    internal class RelyingParty
    {
        public required string Id { get; set; }
        public required AccessLog[] AccessLogs { get; set; }
    }
    internal class AccessLog
    {
        public DateTime LoginTime { get; set; }
        public int ClaimAttributeId { get; set; }
    }
    internal class ClaimAttribute
    {
        public int Id { get; set; }
        public required string Attributes { get; set; }
    }
    internal class UIAMData
    {
        public required string UserId { get; set; }
        public required ClaimAttribute[] ClaimAttributes { get; set; }
        public required RelyingParty[] RelyingParties { get; set; }
    }
    #endregion

    public class UserAccessedServicesRepository : IUserAccessedServicesRepository
    {
        private readonly IServiceRepository _serviceRepository;
        public UserAccessedServicesRepository(IServiceRepository serviceRepository, ILogger<UserAccessedServicesRepository> logger)
        {
            logger.LogWarning("Using Mock eService");
            _serviceRepository = serviceRepository;
        }
        public async Task<GetUserHistoryApiResponse?> GetUserAccessedEServicesAsync(string userId, string requestId, int accessLogLimit = 5)
        {
            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var jsonFilePath = Path.Combine(baseDirectory, "Data", "Mock", "eservices.json");
            string jsonString = await File.ReadAllTextAsync(jsonFilePath);

            EService[]? services = JsonSerializer.Deserialize<EService[]>(jsonString
                , new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            if (services == null || !services.Any())
            {
                return null;
            }
            var userService = Array.Find(services, service => service.UserId == userId);

            if (userService == null)
            {
                return null;
            }

            var limitedAccessLogs = userService.AccessedServices
                .Select(service => new AccessedService
                {
                    Name = service.Name,
                    Sku = service.Sku,
                    AccessLogs = service.AccessLogs.Take(accessLogLimit).ToArray()
                })
                .ToArray();

            return new GetUserHistoryApiResponse
            {
                UserId = userService.UserId,
                IsUserValid = true,
                RequestDateTime = DateTime.Now,
                RequestId = requestId,
                ResponseDateTime = DateTime.Now,
                Products = limitedAccessLogs.Select(service => new Product()
                {
                    Name = service.Name,
                    Sku = service.Sku,
                    AccessLogs = string.Join(",", service.AccessLogs)
                }).ToList(),
            };
        }

        public async Task<IEnumerable<AccessedServices.Models.UIAMData>> GetUserAccessedUIAMDataAsync(string[] relyingPartyIDs, int accessLogLimit = 5)
        {
            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var jsonFilePath = Path.Combine(baseDirectory, "Data", "Mock", "uiam-data.json");
            string jsonString = await File.ReadAllTextAsync(jsonFilePath);

            UIAMData[]? uiamData = JsonSerializer.Deserialize<UIAMData[]?>(jsonString
                , new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            if (uiamData == null || !uiamData.Any())
            {
                return Enumerable.Empty<AccessedServices.Models.UIAMData>();
            }
            var userService = Array.Find(uiamData, service => service.UserId == "verified-user-with-service");//TODO: Use current user to filter

            if (userService == null)
            {
                return Enumerable.Empty<AccessedServices.Models.UIAMData>(); ;
            }

            var services = (await _serviceRepository.GetAllAsync()).Where(service => service.ShowOnUI);

            var accessLogs = userService.RelyingParties
                .Where(rp => services.Select(_ => _.Id).Contains(rp.Id)
                    && !string.IsNullOrWhiteSpace(services.First(_ => _.Id == rp.Id).RPId))
                .Select(rp => new AccessedServices.Models.UIAMData
                {
                    RpId = services.First(service => service.Id == rp.Id).RPId!,
                    AccessedDates = rp.AccessLogs.Select(_ => _.LoginTime).Take(accessLogLimit).ToArray(),
                    ClaimAttributes = rp.AccessLogs
                    .Select(_ => userService.ClaimAttributes.FirstOrDefault(ca => ca.Id == _.ClaimAttributeId)?.Attributes ?? "")
                    .SelectMany(s => s.Split(','))?.Distinct()
                    .Select(claimAttribute => ClaimTypeMap.Claims.ContainsKey(claimAttribute) ? ClaimTypeMap.Claims[claimAttribute] : claimAttribute)
                });

            return accessLogs;
        }
    }
}