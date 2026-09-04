using Microsoft.Azure.Cosmos;

namespace Libs.Data
{
    public interface IBaseRepository<T> where T : class
    {
        Task AddAsync(T item, PartitionKey partitionKey);
        Task<T?> GetByIdAsync(string id, PartitionKey partitionKey);
        Task<IEnumerable<T>> GetAllAsync();
        Task UpdateAsync(T item, PartitionKey partitionKey);

        Task<bool> DeleteAllAsync();
    }
}
