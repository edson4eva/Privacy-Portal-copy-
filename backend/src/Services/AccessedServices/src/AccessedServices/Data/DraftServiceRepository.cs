using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Audit;
using Libs.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Extensions.FileSystemGlobbing.Internal;
using Microsoft.Extensions.Options;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AccessedServices.Data
{
    internal class DraftServiceRepository : BaseRepository<DraftService>, IDraftServiceRepository
    {
        public DraftServiceRepository(CosmosClient cosmosClient, string databaseId, string containerId) : base(cosmosClient, databaseId, containerId)
        {
        }

        public async Task<List<DraftService>> ExecuteQueryAsync(QueryDefinition definition)
        {
            using FeedIterator<DraftService> filteredFeed = _container.GetItemQueryIterator<DraftService>(
                queryDefinition: definition
            );
            var result = new List<DraftService>();
            while (filteredFeed.HasMoreResults)
            {
                FeedResponse<DraftService> response = await filteredFeed.ReadNextAsync();

                // Iterate query results
                foreach (DraftService item in response)
                {
                    result.Add(item);
                }
            }
            return result;
        }

        public async Task<List<DraftService>> GetDraftServicesOrderedByTimestampDesc()
        {
            var query = new QueryDefinition("SELECT * FROM c order by c._ts DESC");

            var iterator = _container.GetItemQueryIterator<DraftService>(
                queryDefinition: query);
            var result = new List<DraftService>();
            while (iterator.HasMoreResults)
            {
                FeedResponse<DraftService> response = await iterator.ReadNextAsync();

                // Iterate query results
                foreach (DraftService item in response)
                {
                    result.Add(item);
                }
            }
            return result;

        }
        public async Task<DraftService?> GetServiceByName(string serviceName)
        {
            var name = serviceName.Trim().ToLower();
            var query = _container.GetItemLinqQueryable<DraftService>()
                .Where(x => (x.ServiceName != null && x.ServiceName.ToLower() == name));
            return await GetServiceByQuery(query);
        }
        public async Task<DraftService?> GetServiceByName(string serviceName, string excludeServiceId)
        {
            var name = serviceName.Trim().ToLower();
            var query = _container.GetItemLinqQueryable<DraftService>()
                .Where(x => (x.ServiceName != null && x.ServiceName.ToLower() == name && x.Id != excludeServiceId));
            return await GetServiceByQuery(query);
        }

        public async Task<DraftService?> GetServiceByRpId(string rpId, string excludeServiceId)
        {
            var relyingPartyId = rpId.Trim().ToLower();
            var query = _container.GetItemLinqQueryable<DraftService>()
                .Where(x => (x.RPId != null && x.RPId.ToLower() == relyingPartyId && x.Id != excludeServiceId));
            return await GetServiceByQuery(query);
        }

        public async Task<DraftService?> GetServiceBySku(string sku, string excludeServiceId)
        {
            var _sku = sku.Trim().ToLower();
            var query = _container.GetItemLinqQueryable<DraftService>()
                .Where(x => (x.Sku != null && x.Sku.ToLower() == _sku && x.Id != excludeServiceId));
            return await GetServiceByQuery(query);
        }

        public async Task<DraftService?> GetServiceByUatRpId(string rpIdUat, string excludeServiceId)
        {
            var UatRelyingPartyId = rpIdUat.Trim().ToLower();
            var query = _container.GetItemLinqQueryable<DraftService>()
                .Where(x => (x.RPIdForUAT !=null && x.RPIdForUAT.ToLower() == UatRelyingPartyId && x.Id != excludeServiceId));
            return await GetServiceByQuery(query);
        }

        protected async Task<DraftService?> GetServiceByQuery(IQueryable<DraftService> query)
        {
            var iterator = query.ToFeedIterator();
            while (iterator.HasMoreResults)
            {
                FeedResponse<DraftService> response = await iterator.ReadNextAsync();
                return response.FirstOrDefault();
            }
            return null;
        }
    }
}
