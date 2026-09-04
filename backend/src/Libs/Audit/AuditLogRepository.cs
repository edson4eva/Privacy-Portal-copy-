using Microsoft.Azure.Cosmos;
using Libs.Data;
using Microsoft.Azure.Cosmos.Linq;

namespace Libs.Audit
{
    public class AuditLogRepository : BaseRepository<Audit.AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(AuditLogCosmosClient cosmosClient)
            : base(cosmosClient, AuditLogCosmosDbConfig.DatabaseName, AuditLogCosmosDbConfig.AuditLogContainer.Id)
        {
        }

        public async Task<IEnumerable<AuditLog>> GetRecentEntries(string serviceCategory, int maxCount)
        {
            var queryDefinition = new QueryDefinition($"SELECT TOP {maxCount} * FROM c WHERE c.ServiceCategory = @category ORDER BY c._ts DESC")
                .WithParameter("@category", serviceCategory);
            return await GetAllAsync(queryDefinition);
        }
        public async Task<IEnumerable<AuditLog>> GetEntries(string serviceCategory, int maxCount, string? pattern,
            string? userId, List<string>? actions, DateTime? beginDate, DateTime? endDate)
        {
            var query = _container.GetItemLinqQueryable<AuditLog>()
                .Where(x => x.ServiceCategory == serviceCategory);
            if (userId != null)
            {
                query = query.Where(x => x.UserId == userId);
            }
            if (actions != null && actions.Count() > 0)
            {
                query = query.Where(x => actions.Contains(x.Action));
            }
            if (beginDate != null)
            {
                query = query.Where(x => x.Timestamp >= beginDate);
            }
            if (endDate != null)
            {
                query = query.Where(x => x.Timestamp <= endDate);
            }
            if (pattern != null && !string.IsNullOrWhiteSpace(pattern))
            {
                query = query.Where(x => x.Description != null && x.Description.ToLower().Contains(pattern.ToLower()));
            }
            var iterator = query.OrderByDescending(x => x.Timestamp).ToFeedIterator();
            var result = new List<AuditLog>();
            while (iterator.HasMoreResults)
            {
                FeedResponse<AuditLog> response = await iterator.ReadNextAsync();
                result.AddRange(response);

                if (result.Count >= maxCount) { break; }
            }
            return result;
        }
    }
}
