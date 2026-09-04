using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data.AccessLogApiResponseMock;

namespace AccessedServices.Data.Publish
{
    public class DevPublishEnvironment(string tag, IExternalServiceRepository previewRepo, IExternalServiceRepository serviceRepo, IMockApiResponseEServiceRepository mockEServiceRepo, IMockApiResponseUIAMRepository mockUIAMRepo,
        IRedisClient client) 
        : PublishEnvironment(tag, previewRepo, serviceRepo, client)
    {
        private readonly IMockApiResponseEServiceRepository _mockEServiceRepo = mockEServiceRepo;
        private readonly IMockApiResponseUIAMRepository _mockUIAMRepo = mockUIAMRepo;

        private async Task InsertMockServiceData()
        {
            var services = await _previewRepo.GetAllAsync();
            foreach (var service in services)
            {
                await UpdateServiceMockData(service);
            }
        }
        public override async Task UpdatePreviewTable(IEnumerable<Service> newServices)
        {
            await base.UpdatePreviewTable(newServices);
            await InsertMockServiceData();
        }
        private async Task UpdateServiceMockData(Service service)
        {
            var eServiceData = await _mockEServiceRepo.GetByIdAsync(service.Id);
            var uiamData = await _mockUIAMRepo.GetByIdAsync(service.Id);
            if (service.ShowMockInDev)
            {
                if (service.Origin == Origin.EServices)
                {
                    if (eServiceData == null)
                    {
                        var data = new MockApiResponseEServiceRecord() { Id = service.Id, AccessedDates = PublishUtils.GetRandomAccessDates() };
                        await _mockEServiceRepo.AddAsync(data);
                    }
                }
                else
                {
                    if (uiamData == null)
                    {
                        var data = new MockApiResponseUIAMRecord() { Id = service.Id, AccessedDates = PublishUtils.GetRandomAccessDates() };
                        await _mockUIAMRepo.AddAsync(data);
                    }
                }
            }
            else
            {
                if (service.Origin == Origin.EServices)
                {
                    if (eServiceData != null)
                    {
                        await _mockEServiceRepo.DeleteAsync(eServiceData.Id);
                    }
                }
                else
                {
                    if (uiamData != null)
                    {
                        await _mockUIAMRepo.DeleteAsync(uiamData.Id);
                    }
                }
            }
        }
    }
}
