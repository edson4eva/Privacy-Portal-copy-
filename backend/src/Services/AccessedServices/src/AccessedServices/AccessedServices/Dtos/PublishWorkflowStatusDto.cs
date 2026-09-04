using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.AccessedServices.Dtos
{
    public class PublishWorkflowStatusDto: PublishWorkflowStatus
    {
        public bool? IsPublishDisabled { get; set; }
    }
}
