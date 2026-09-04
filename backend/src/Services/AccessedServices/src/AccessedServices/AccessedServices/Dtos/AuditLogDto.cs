using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.AccessedServices.Dtos
{
    public class AuditLogDto
    {
        public const string AddServiceAction = "Added";
        public const string UpdateServiceAction = "Updated";
        public const string PublishAction = "Published";
        public const string RollbackAction = "Rolled back";

        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string Action { get; set; }
        public string? Description { get; set; }
        public PublishWorkflowStatus? Status { get; set; }
        public required DateTime Timestamp { get; set; }
    }
}
