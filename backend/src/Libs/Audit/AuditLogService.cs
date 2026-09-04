using GoA.UiamRpClientLib.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using System.Text.Json;

namespace Libs.Audit
{
    public class AuditLogService : IAuditLogService
    {
        private IAuditLogRepository _auditLogRepository;
        private IHttpContextAccessor _httpContextAccessor;
        public AuditLogService(IAuditLogRepository auditLogRepository, IHttpContextAccessor httpContextAccessor)
        {
            _auditLogRepository = auditLogRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private void LogAudit(string ServiceCategory, string Action, string? Details = null, string? Description=null)
        {
            var user = _httpContextAccessor.HttpContext?.User as User;
            var userId = "GUEST";
            if (user != null) userId = user.PrimaryEmailAddress;
            var auditLog = new AuditLog() { Id = Guid.NewGuid().ToString(), UserId = userId, ServiceCategory = ServiceCategory, Action = Action, Details = Details, Timestamp = DateTime.Now, Description = Description};
            _ = Task.Run(async () =>
            {
                try
                {
                    await _auditLogRepository.AddAsync(auditLog, new Microsoft.Azure.Cosmos.PartitionKey(auditLog.UserId));
                }
                catch { }
            });
        }

        public void Log(string serviceCategory, string action)
        {
            LogAudit(serviceCategory, action, Details: null);
        }

        public void Log(string serviceCategory, string action, dynamic details, string? description=null)
        {
            LogAudit(serviceCategory, action, JsonSerializer.Serialize(details), description);
        }

        public void LogCreate(string serviceCategory, string action, dynamic requestDetails, dynamic result)
        {
            var details = JsonSerializer.Serialize(new { Request = requestDetails, Result = result });
            LogAudit(serviceCategory, action, details);
        }

        public void LogRead(string serviceCategory, string action, dynamic requestDetails, dynamic response)
        {
            var details = JsonSerializer.Serialize(new { Request = requestDetails, Response = response });
            LogAudit(serviceCategory, action, details);
        }

        public void LogUpdate(string serviceCategory, string action, dynamic requestDetails, dynamic existingState, dynamic newState)
        {
            var details = JsonSerializer.Serialize(new { Request = requestDetails, Result = new { ExistingState = existingState, NewState = newState } });
            LogAudit(serviceCategory, action, details);
        }

        public void LogDelete(string serviceCategory, string action, dynamic requestDetails, dynamic existingState)
        {
            var details = JsonSerializer.Serialize(new { Request = requestDetails, Deleted = existingState });
            LogAudit(serviceCategory, action, details);
        }
    }
}
