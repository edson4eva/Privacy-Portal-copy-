using Azure.Core;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Audit
{
    public class AuditLogCosmosClient:CosmosClient
    {
        public AuditLogCosmosClient(string connectionString, CosmosClientOptions? clientOptions = null):base(connectionString,clientOptions) { }
        public AuditLogCosmosClient(string connectionString, TokenCredential credential, CosmosClientOptions? clientOptions = null) : base(connectionString, credential, clientOptions) { }
    }
}
