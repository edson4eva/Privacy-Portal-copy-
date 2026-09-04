using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Features.Admin.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.Data;
using GoA.UiamRpClientLib.ServiceModels;
using Libs.Audit;

namespace AccessedServices.AccessedServices.Services
{
    public record AdminAuditLogInfo(dynamic Request, string? Description, PublishWorkflowStatus? Status, string? Error = null);
    public class AdminAuditLogService(IAuditLogService auditLogService) : IAdminAuditLogService
    {
        public void LogCreateService(CreateService request)
        {
            var description = $"New Service - {request.CreateServiceDto.ServiceName}";
            var info = new AdminAuditLogInfo(
                Request: request,
                Description: description,
                Status: null
            );
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.AddService, info, description);
        }

        public void LogCreateServiceSection(CreateServiceSection request, DraftService service)
        {
            var decription = $"{service.ServiceName} > Added new accordion - {request.ServiceSectionDto.Title}";
            var info = new AdminAuditLogInfo(
                Request: request,
                Description: decription,
                Status: null
            );            
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.AddServiceSection, info, decription);
        }

        public void LogDeleteServiceSection(DeleteServiceSection request, ServiceDataSection section, DraftService service)
        {
            var description = $"{service.ServiceName} > Deleted accordion - {section.Title}";
            var info = new AdminAuditLogInfo(
                Request: request,
                Description: description,
                Status: null);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.DeleteServiceSection, info, description);
        }

        public void LogUpdateServiceDetails(UpdateServiceDetail detail, List<string> changes)
        {
            foreach (var description in changes)
            {
                var info = new AdminAuditLogInfo(
                Request: detail,
                Description: description,
                Status: null);
                auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.UpdateServiceDetail, info, description);
            }
        }

        public void LogUpdateServiceSection(UpdateServiceSection request, ServiceDataSection section, DraftService service)
        {
            string? description = null;
            description = $"{service.ServiceName} > {section.Title}";            
            var info = new AdminAuditLogInfo(
               Request: request,
               Description: description,
               Status: null);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.UpdateServiceSection, info, description);
        }
        public void LogPublish(PublishRequest request, PublishWorkflowStatus workflow)
        {
            var description = $"To {request.Dto.env.ToUpper()}";
            var info = new AdminAuditLogInfo(
               Request: request,
               Description: description,
               Status: workflow);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.PublishAction, info, description);
        }
        public void LogRollback(Rollback request, PublishWorkflowStatus workflow)
        {
            var info = new AdminAuditLogInfo(
               Request: request,
               Description: "Changes rolled back",
               Status: workflow);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.RollbackAction, info);
        }
        public void LogStartPublish(StartPublish request, PublishWorkflowStatus workflow)
        {
            var description = "Started publishing process";
            var info = new AdminAuditLogInfo(
               Request: request,
               Description: description,
               Status: workflow);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.PublishAction, info, description);
        }

        public void LogUpdatePublishDescription(UpdatePublishDesc request, PublishWorkflowStatus workflow)
        {
            var description = "Updated description of changes made";
            var info = new AdminAuditLogInfo(
               Request: request,
               Description: description,
               Status: workflow);
            auditLogService.Log(ServiceCategory.AdminPortal, AuditLogActionCategory.PublishAction, info, description);
        }
    }
}
