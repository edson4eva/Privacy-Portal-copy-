using Microsoft.Azure.Cosmos;

namespace Complaints.Data
{    
    public static class CosmosDbConfig
    {
        public static readonly string DatabaseName = "ComplaintsDB";

        public static readonly ContainerProperties ComplaintsContainer = new ContainerProperties("Complaints", "/userId");
    }
}
