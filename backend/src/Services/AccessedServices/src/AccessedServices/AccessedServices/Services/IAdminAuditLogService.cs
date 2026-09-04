using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Features.Admin.V1;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.AccessedServices.Services
{
    public interface IAdminAuditLogService
    {
        void LogCreateService(CreateService request);
        void LogCreateServiceSection(CreateServiceSection request, DraftService service);
        void LogDeleteServiceSection(DeleteServiceSection request, ServiceDataSection section, DraftService service);
        void LogUpdateServiceSection(UpdateServiceSection request, ServiceDataSection section, DraftService service);
        void LogUpdateServiceDetails(UpdateServiceDetail detail, List<string> changes);
        void LogPublish(PublishRequest request, PublishWorkflowStatus workflow);
        void LogRollback(Rollback request, PublishWorkflowStatus workflow);
        void LogStartPublish(StartPublish request, PublishWorkflowStatus workflow);
        void LogUpdatePublishDescription(UpdatePublishDesc request, PublishWorkflowStatus workflow);

    }
}
