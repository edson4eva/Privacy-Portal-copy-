using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;

namespace AccessedServices.Data.Publish
{
    public interface IExternalServiceRepository: IServiceRepository
    {
        Task DeleteAsync(string id, PartitionKey partitionKey);
    }
}
