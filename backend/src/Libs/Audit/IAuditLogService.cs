using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public interface IAuditLogService
    {
        void Log(string serviceCategory, string action);
        void Log(string serviceCategory, string action, dynamic details, string? description=null);
        void LogCreate(string serviceCategory, string action, dynamic requestDetails, dynamic result);
        void LogRead(string serviceCategory, string action, dynamic requestDetails, dynamic response);
        void LogUpdate(string serviceCategory, string action, dynamic requestDetails, dynamic existingState, dynamic newState);
        void LogDelete(string serviceCategory, string action, dynamic requestDetails, dynamic existingState);
    }
}
