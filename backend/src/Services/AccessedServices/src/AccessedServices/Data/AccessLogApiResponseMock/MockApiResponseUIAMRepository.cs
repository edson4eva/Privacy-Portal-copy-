using AccessedServices.AccessLogApiResponseMock.Models;
using AccessedServices.Shared.Constants;
using Libs.Data;
using MapsterMapper;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;

namespace AccessedServices.Data.AccessLogApiResponseMock
{
    public class MockApiResponseUIAMRecord: MockApiResponseUIAM
    {
        public string Origin { get; } = ServiceOrigin.UIAM;
    }
    public class MockApiResponseUIAMRepository : BaseRepository<MockApiResponseUIAMRecord>, IMockApiResponseUIAMRepository
    {
        private readonly IMapper _mapper;
        public MockApiResponseUIAMRepository(IServiceProvider serviceProvider, CosmosClient cosmosClient, string databaseId, string containerId) : base(cosmosClient, databaseId, containerId)
        {
            _mapper = serviceProvider.GetRequiredService<IMapper>();
        }

        public async Task AddAsync(MockApiResponseUIAM item)
        {
            var uiam = _mapper.Map<MockApiResponseUIAMRecord>(item);
            await AddAsync(uiam, new PartitionKey(ServiceOrigin.UIAM));
        }
        public async Task<MockApiResponseUIAM?> GetByIdAsync(string id)
        {
            var result = await GetByIdAsync(id, new PartitionKey(ServiceOrigin.UIAM));
            return result != null ? _mapper.Map<MockApiResponseUIAM>(result) : null;
        }
        public new async Task<IEnumerable<MockApiResponseUIAM>> GetAllAsync()
        {
            var query = $"SELECT * FROM c WHERE c.origin = '{ServiceOrigin.UIAM}'";
            var result = await GetAllAsync(query);
            return _mapper.Map<IEnumerable<MockApiResponseUIAM>>(result);
        }

        public async Task DeleteAsync(string id)
        {
            await _container.DeleteItemAsync<MockApiResponseUIAM>(id, new PartitionKey(ServiceOrigin.UIAM));
        }
    }
}
