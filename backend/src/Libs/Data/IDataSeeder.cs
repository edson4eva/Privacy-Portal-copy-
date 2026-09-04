using Microsoft.Azure.Cosmos;

namespace Libs.Data
{
    public interface IDataSeeder
    {
        public Task SeedAsync();
    }
}
