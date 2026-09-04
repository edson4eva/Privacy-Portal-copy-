using AccessedServices.AccessLogApiResponseMock.Models;
using AccessedServices.Shared.Constants;
using Libs.Data;
using MapsterMapper;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;

namespace AccessedServices.Data.AccessLogApiResponseMock
{
    public class MockApiResponseEServiceRecord: MockApiResponseEService
    {
        public string Origin { get; set; } = ServiceOrigin.EServices;
    }
    public class MockApiResponseEServiceRepository : BaseRepository<MockApiResponseEServiceRecord>, IMockApiResponseEServiceRepository
    {
        private readonly IMapper _mapper;

        public MockApiResponseEServiceRepository(IServiceProvider serviceProvider, CosmosClient cosmosClient, string databaseId, string containerId) : base(cosmosClient, databaseId, containerId)
        {
            _mapper = serviceProvider.GetRequiredService<IMapper>();
        }
        public async Task AddAsync(MockApiResponseEService item)
        {
            var eService = _mapper.Map<MockApiResponseEServiceRecord>(item);
            await _container.UpsertItemAsync(eService,new PartitionKey(ServiceOrigin.EServices));
        }
        public async Task<MockApiResponseEService?> GetByIdAsync(string id)
        {
            var result = await GetByIdAsync(id, new PartitionKey(ServiceOrigin.EServices));
            return result != null ? _mapper.Map<MockApiResponseEService>(result) : null;
        }
        public new async Task<IEnumerable<MockApiResponseEService>> GetAllAsync()
        {
            var query = $"SELECT * FROM c WHERE c.origin = '{ServiceOrigin.EServices}'";            
            var result = await GetAllAsync(query);
            return _mapper.Map<IEnumerable<MockApiResponseEService>>(result);
        }

        public async Task DeleteAsync(string id)
        {
            await _container.DeleteItemAsync<MockApiResponseEService>(id, new PartitionKey(ServiceOrigin.EServices));
        }
    }
}