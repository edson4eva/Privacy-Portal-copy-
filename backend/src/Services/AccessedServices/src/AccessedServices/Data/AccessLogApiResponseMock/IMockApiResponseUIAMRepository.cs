using AccessedServices.AccessLogApiResponseMock.Models;

namespace AccessedServices.Data.AccessLogApiResponseMock
{
    public interface IMockApiResponseUIAMRepository
    {
        Task AddAsync(MockApiResponseUIAM item);
        Task<MockApiResponseUIAM?> GetByIdAsync(string id);
        Task<IEnumerable<MockApiResponseUIAM>> GetAllAsync();
        Task DeleteAsync(string id);
    }
}
