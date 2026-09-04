using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.Data.Publish
{
    internal interface IPublishEnvironment
    {
        Task<IEnumerable<Service>> GetAllPreviewServices();
        Task<IEnumerable<Service>> GetAllServices();
        Task CopyPreviewToServiceTable();
        Task CopyServicesToPreviewTable();
        Task UpdatePreviewTable(IEnumerable<Service> newServices);
        Task UpdateServicesTable(IEnumerable<Service> newServices);
        Task FlushCache();
    }
}
