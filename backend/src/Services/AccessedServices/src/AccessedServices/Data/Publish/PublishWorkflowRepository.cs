using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;
using Microsoft.FSharp.Linq;

namespace AccessedServices.Data.Publish
{
    public class PublishWorkflowRepository : BaseRepository<PublishWorkflowStatus>, IPublishWorkflowRepository
    {
        public PublishWorkflowRepository(CosmosClient cosmosClient, string databaseId, string containerId) : base(cosmosClient, databaseId, containerId)
        {
        }

        public async Task<PublishWorkflowStatus?> GetCurrent()
        {
            try
            {
                var id = PublishWorkflowStatus.CURRENT;
                var response = await _container.ReadItemAsync<PublishWorkflowStatus>(id, new PartitionKey(id));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
        }

        public async Task<PublishWorkflowStatus> ResetCurrent()
        {
            var workflow = new PublishWorkflowStatus()
            {
                Id = PublishWorkflowStatus.CURRENT,
                Guid = Guid.NewGuid().ToString(),
                Status = (int)PublishStatus.NotStarted
            };
            await _container.UpsertItemAsync(workflow, new PartitionKey(workflow.Id));
            return workflow;
        }
    }
}
