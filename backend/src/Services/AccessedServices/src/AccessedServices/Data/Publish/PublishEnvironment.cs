using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data.AccessLogApiResponseMock;
using Azure.Core;
using Mapster;
using Microsoft.Azure.Cosmos;
using StackExchange.Redis;

namespace AccessedServices.Data.Publish
{
    public class PublishEnvironment(
        string tag,
        IExternalServiceRepository previewRepo,
        IExternalServiceRepository serviceRepo,
        IRedisClient redisClient
        ): IPublishEnvironment
    {
        public const string PROD = "prod";
        public const string UAT = "uat";
        public const string DEV = "dev";
        public const string MOCK_TABLE = "AccessLogApiResponseMock";
        public string EnvTag { get; set; } = tag;
        protected readonly IExternalServiceRepository _previewRepo = previewRepo;
        protected readonly IExternalServiceRepository _serviceRepo = serviceRepo;
        public async Task<IEnumerable<Service>> GetAllPreviewServices()
        {
            return await _previewRepo.GetAllAsync();
        }
        public async Task<IEnumerable<Service>> GetAllServices()
        {
            return await _serviceRepo.GetAllAsync();
        }
        public async Task FlushCache()
        {
            await redisClient.FlushCache();
        }
        public async Task CopyPreviewToServiceTable()
        {
            var previewServices = await _previewRepo.GetAllAsync();
            var newIds = new HashSet<string>(previewServices.Select(x => x.Id).Distinct());
            var services = await _serviceRepo.GetAllAsync();
            var oldIds = new HashSet<string>(services.Select(x => x.Id).Distinct());

            foreach (var service in previewServices)
            {
                await _serviceRepo.UpdateAsync(service, new PartitionKey(service.Id));
            }

            foreach (var id in oldIds)
            {
                if (!newIds.Contains(id))
                {
                    await _serviceRepo.DeleteAsync(id, new PartitionKey(id));
                }
            }
        }
        public async Task CopyServicesToPreviewTable()
        {
            var allPreviewServices = await _previewRepo.GetAllAsync();
            var services = await _serviceRepo.GetAllAsync();
            var serviceIds = new HashSet<string>(services.Select(x => x.Id).Distinct());
            var previewIds = new HashSet<string>(allPreviewServices.Select(x => x.Id).Distinct());

            foreach (var service in services)
            {
                await _previewRepo.UpdateAsync(service, new PartitionKey(service.Id));
            }
            foreach (var id in previewIds)
            {
                if (!serviceIds.Contains(id))
                {
                    await _previewRepo.DeleteAsync(id, new PartitionKey(id));
                }
            }
        }
        public virtual async Task UpdatePreviewTable(IEnumerable<Service> newServices)
        {
            var previewServices = await _previewRepo.GetAllAsync();
            var oldIds = new HashSet<string>(previewServices.Select(x => x.Id).Distinct());
            var newIds = new HashSet<string>(newServices.Select(x => x.Id).Distinct());

            foreach (var service in newServices)
            {
                await _previewRepo.UpdateAsync(service, new PartitionKey(service.Id));
            }
            foreach (var id in oldIds)
            {
                if (!newIds.Contains(id))
                {
                    await _previewRepo.DeleteAsync(id, new PartitionKey(id));
                }
            }
        }
        public async Task UpdateServicesTable(IEnumerable<Service> newServices)
        {
            var newServiceIds = new HashSet<string>(newServices.Select(x => x.Id).Distinct());
            var oldServices = await _serviceRepo.GetAllAsync();
            var oldServiceIds = new HashSet<string>(oldServices.Select(x => x.Id).Distinct());
            foreach (var service in newServices)
            {
                await _serviceRepo.UpdateAsync(service, new PartitionKey(service.Id));
            }
            foreach (var id in oldServiceIds)
            {
                if (!newServiceIds.Contains(id))
                {
                    await _serviceRepo.DeleteAsync(id, new PartitionKey(id));
                }
            }
        }
        public static bool Contains(string env)
        {
            return env == DEV || env == UAT || env == PROD;
        }
    }
}
