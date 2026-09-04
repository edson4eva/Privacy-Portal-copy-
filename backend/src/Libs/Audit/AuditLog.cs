using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public static class ServiceCategory
    {
        public const string AccountHistory = "account-history";
        public const string Complaints = "complaints";
        public const string AdminPortal = "admin-portal";
    }
    public static class AuditLogActionCategory
    {
        public const string AddService = "added-service";
        public const string UpdateServiceDetail = "updated-service-detail";
        public const string AddServiceSection = "added-service-section";
        public const string UpdateServiceSection = "updated-service-section";
        public const string DeleteServiceSection = "deleted-service-section";
        public const string PublishAction = "publish";
        public const string RollbackAction = "rollback";
    }
    public class AuditLog
    {
        public required string Id {  get; set; }
        /// <summary>
        /// This should match one of the service categories defined in the <see cref="ServiceCategory"/> class.
        /// </summary>
        public required string ServiceCategory { get; set; }
        public required string UserId { get; set; }
        public required string Action { get; set; }
        public string? Description { get; set; }
        public string? Details { get; set; } //json
        public required DateTime Timestamp { get; set; }
    }
}
