using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal interface IPublishWorkflowManager
    {
        Task NewDraftModification();
    }
}
