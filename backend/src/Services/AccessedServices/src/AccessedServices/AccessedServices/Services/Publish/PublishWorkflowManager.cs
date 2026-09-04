using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data.Publish;
using MediatR;
using Microsoft.IdentityModel.Tokens;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal class PublishWorkflowManager(IPublishWorkflowRepository workflowRepo) : IPublishWorkflowManager
    {
        private IPublishWorkflowRepository _workflowRepo = workflowRepo;

        public async Task NewDraftModification()
        {
            var workflow = await _workflowRepo.GetCurrent();
            if (workflow != null)
            {
                var status = (PublishStatus)workflow.Status;
                if(status == PublishStatus.Completed)
                {
                    if(workflow.Guid.IsNullOrEmpty())
                    {
                        workflow.Guid = Guid.NewGuid().ToString();                        
                    }
                    workflow.Id = workflow.Guid;
                    await _workflowRepo.AddAsync(workflow, new Microsoft.Azure.Cosmos.PartitionKey(workflow.Id));
                    await _workflowRepo.ResetCurrent();
                }
            }
        }
    }
}
