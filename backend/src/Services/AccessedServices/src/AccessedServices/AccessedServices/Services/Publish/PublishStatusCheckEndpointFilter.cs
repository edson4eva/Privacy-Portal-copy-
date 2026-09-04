using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data.Publish;
using Microsoft.AspNetCore.Http;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal class PublishStatusCheckEndpointFilter(IPublishWorkflowRepository repo) : IEndpointFilter
    {
        private readonly IPublishWorkflowRepository _workflowRepo = repo;

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var workflow = await _workflowRepo.GetCurrent();
            if (workflow != null)
            {
                var status = (PublishStatus)workflow.Status;
                if(status != PublishStatus.NotStarted && status != PublishStatus.Completed)
                {
                    return Results.Problem("Modification is not allowed, publish in progress!");
                }
            }
            var result = await next(context);
            return result;
        }
    }
}
