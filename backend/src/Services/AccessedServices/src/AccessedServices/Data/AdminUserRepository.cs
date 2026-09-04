using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace AccessedServices.Data
{
    public class AdminUserRepository : BaseRepository<AdminUser>, IAdminUserRepository
    {
        public AdminUserRepository(CosmosClient cosmosClient, string databaseId, string containerId) : base(cosmosClient, databaseId, containerId)
        {
        }
    }
}
