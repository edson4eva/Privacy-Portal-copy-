using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data
{
    public static class CosmosDbConfig
    {
        public static readonly string DatabaseName = "AccountHistoryDB";

        public static readonly ContainerProperties ServicesContainer = new ContainerProperties("Services", "/id");

        public static readonly ContainerProperties ServicesPreviewContainer = new ContainerProperties("ServicesPreview", "/id");

        public static readonly ContainerProperties AccessLogApiResponseMock = new ContainerProperties("AccessLogApiResponseMock", "/origin");

        public static readonly ContainerProperties AdminUsersContainer = new ContainerProperties("AdminUsers", "/id");

        public static readonly ContainerProperties PublishWorkflowContainer = new ContainerProperties("PublishWorkflow", "/id");

        public static readonly ContainerProperties ServicesDataContainer = new ContainerProperties("ServicesData", "/id");

        public static readonly ContainerProperties DraftServicesDataContainer = new ContainerProperties("DraftServices", "/id");
    }
}
