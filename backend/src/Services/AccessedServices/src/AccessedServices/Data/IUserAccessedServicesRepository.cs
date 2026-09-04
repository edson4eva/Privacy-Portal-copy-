using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.AccessedServices.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data
{
    public interface IUserAccessedServicesRepository
    {
        Task<GetUserHistoryApiResponse?> GetUserAccessedEServicesAsync(string userId, string requestId, int accessLogLimit = 5);
        Task<IEnumerable<UIAMData>> GetUserAccessedUIAMDataAsync(string[] relyingPartyIDs, int accessLogLimit = 5);
    }
}
