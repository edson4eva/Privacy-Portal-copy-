using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data.Mock;
using Google.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AccessedServices.Data.AccessLogApiResponseMock
{
    public class UserAccessedServicesRepository : IUserAccessedServicesRepository
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMockApiResponseEServiceRepository _mockApiResponseEServiceRepository;
        private readonly IMockApiResponseUIAMRepository _mockApiResponseUIAMRepository;
        public UserAccessedServicesRepository(IServiceRepository serviceRepository
            , IMockApiResponseEServiceRepository mockApiResponseEServiceRepository
            , IMockApiResponseUIAMRepository mockApiResponseUIAMRepository) {
            _serviceRepository = serviceRepository;
            _mockApiResponseEServiceRepository = mockApiResponseEServiceRepository;
            _mockApiResponseUIAMRepository = mockApiResponseUIAMRepository;
        }
        public async Task<GetUserHistoryApiResponse?> GetUserAccessedEServicesAsync(string userId, string requestId, int accessLogLimit = 5)
        {
            var eServicesApiResponse = await _mockApiResponseEServiceRepository.GetAllAsync();
            if (eServicesApiResponse == null || !eServicesApiResponse.Any())
            {
                return null;
            }

            var availableServices = await _serviceRepository.GetAllAsync();
            var availableEServiceIds = availableServices.Where(s => s.Origin == Origin.EServices).Select(s => s.Id);

            var accessedServices = eServicesApiResponse.Where(_=> availableEServiceIds.Contains(_.Id)).Select(_ => 
            {
                var service = availableServices.First(s=>s.Id == _.Id);
                return new Product()
                {
                    Name = service.ServiceName,
                    Sku = service.Sku!,
                    AccessLogs = string.Join(",", _.AccessedDates!.Take(accessLogLimit))
                };
            }).ToList();

            return new GetUserHistoryApiResponse
            {
                UserId = userId,
                IsUserValid = true,
                RequestDateTime = DateTime.Now,
                RequestId = requestId,
                ResponseDateTime = DateTime.Now,
                Products = accessedServices,
            };
        }

        public async Task<IEnumerable<AccessedServices.Models.UIAMData>> GetUserAccessedUIAMDataAsync(string[] relyingPartyIDs, int accessLogLimit = 5)
        {
            var uiamApiResponse = await _mockApiResponseUIAMRepository.GetAllAsync();
            if (uiamApiResponse == null || !uiamApiResponse.Any())
            {
                return Enumerable.Empty<AccessedServices.Models.UIAMData>();
            }

            var availableServices = await _serviceRepository.GetAllAsync();
            var availableUiamIds = availableServices.Where(s => s.Origin == Origin.UIAM).Select(s => s.Id);

            var accessedServices = uiamApiResponse.Where(_ => availableUiamIds.Contains(_.Id)).Select(_ =>
            {
                var service = availableServices.First(s => s.Id == _.Id);
                return new AccessedServices.Models.UIAMData
                {
                    RpId = service.RPId!,
                    AccessedDates = _.AccessedDates!.Take(accessLogLimit).ToArray()
                };
            });

            return accessedServices;
        }
    }
}
