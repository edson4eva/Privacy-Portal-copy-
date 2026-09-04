using AccessedServices.AccessedServices.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Services
{
    public interface IAccessLogService
    {
        Task<AccessedServicesResult> GetUserAccessedServicesAsync(string userId);
    }
}
