using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace AccessedServices.Data.Publish
{
    public interface IPublishWorkflowRepository : IBaseRepository<PublishWorkflowStatus>
    {
        Task<PublishWorkflowStatus?> GetCurrent();
        Task<PublishWorkflowStatus> ResetCurrent();
    }
}
