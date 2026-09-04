using AccessedServices.AccessLogApiResponseMock.Models;
using Libs.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data.AccessLogApiResponseMock
{
    public interface IMockApiResponseEServiceRepository
    {
        Task AddAsync(MockApiResponseEService item);
        Task<MockApiResponseEService?> GetByIdAsync(string id);
        Task<IEnumerable<MockApiResponseEService>> GetAllAsync();
        Task DeleteAsync(string id);
    }
}
