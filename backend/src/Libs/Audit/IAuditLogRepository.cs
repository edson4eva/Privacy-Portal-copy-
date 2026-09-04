using Libs.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public interface IAuditLogRepository : IBaseRepository<AuditLog>
    {
        Task<IEnumerable<AuditLog>> GetRecentEntries(string serviceCategory, int maxCount);
        Task<IEnumerable<AuditLog>> GetEntries(string serviceCategory, int maxCount, string? pattern,
            string? userId, List<string>? actions, DateTime? beginDate, DateTime? endDate);
    }
}
