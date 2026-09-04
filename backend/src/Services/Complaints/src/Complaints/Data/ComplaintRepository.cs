using Complaints.Complaints.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace Complaints.Data
{
    public class ComplaintRepository : BaseRepository<Complaint>, IComplaintRepository
    {
        public ComplaintRepository(CosmosClient cosmosClient, string databaseId, string containerId)
            : base(cosmosClient, databaseId, containerId) { }

        public async Task<IEnumerable<Complaint>> GetComplaintsByUserIdAsync(string userId)
        {
            var query = new QueryDefinition("SELECT * FROM c WHERE c.userId = @userId AND @userId != 'guest'")
                    .WithParameter("@userId", userId);

            var iterator = _container.GetItemQueryIterator<Complaint>(query, requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) });
            List<Complaint> results = new List<Complaint>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync();
                results.AddRange(response);
            }

            return results;
        }
    }

}
