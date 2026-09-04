using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace AccessedServices.Data
{
    public interface IDraftServiceRepository: IBaseRepository<DraftService>
    {
        Task<List<DraftService>> ExecuteQueryAsync(QueryDefinition definition);
        Task<List<DraftService>> GetDraftServicesOrderedByTimestampDesc();
        Task<DraftService?> GetServiceByName(string serviceName, string excludeServiceId);
        Task<DraftService?> GetServiceBySku(string sku, string excludeServiceId);
        Task<DraftService?> GetServiceByRpId(string rpId, string excludeServiceId);
        Task<DraftService?> GetServiceByUatRpId(string rpIdUat, string excludeServiceId);
    }
}
