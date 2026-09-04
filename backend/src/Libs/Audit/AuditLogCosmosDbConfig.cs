using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public static class AuditLogCosmosDbConfig
    {
        public static readonly string DatabaseName = "PrivacyPortalAuditLogDB";

        public static readonly ContainerProperties AuditLogContainer = new ContainerProperties("AuditLog", "/userId");
    }
}
