using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Shared.Constants
{
    public static class ServiceOrigin
    {
        public const string UIAM = "UIAM";
        public const string EServices = "eServices";
    }
    public static class ServiceValidationErrors
    {
        public const string SERVICE_NAME_MISSING = "Service name is required.";
        public const string SERVICE_DESC_MISSING = "Description is required.";
        public const string CATEGORY_MISSING = "Category is required.";
        public const string DATA_OWNER_MISSING = "Data Owner is required.";
        public const string SERVICE_LINK_MISSING = "Service access link is required.";
        public const string SHOW_MOCK_IN_DEV_MISSING = "ShowMockInDev is required.";
        public const string ORIGIN_MISSING = "Origin is required.";
        public const string INVALID_ORIGIN = "Invalid origin.";
        public const string INVALID_CATEGORY = "Invalid category";
        public const string INVALID_DATAOWNER = "Invalid data owner.";
        public const string INVALID_SERVICE_LINK = "Invalid service access link";
        public const string SERVICE_NAME_TOO_LONG = "Service name no more than 100 characters.";
        public const string SERVICE_DESC_TOO_LONG = "Description no more than 5000 characters.";
        public const string RPID_TOO_LONG = "RP ID no more than 100 characters.";
        public const string RPID_UAT_TOO_LONG = "RP ID (UAT) no more than 100 characters.";
        public const string SKU_TOO_LONG = "SKU no more than 100 characters.";
        public const string SERVICE_AVAILABILITY_MISSING = "Service availability is required.";

        public const string RP_ID_MISSING = "RP ID is required.";
        public const string RP_ID_UAT_MISSING = "RP ID (UAT) is required.";
        public const string SKU_MISSING = "SKU is required.";
        public const string SERVICE_NAME_CONFLICT = "Service name already exists.";
        public const string SERVICE_SKU_CONFLICT = "SKU already exists.";
        public const string SERVICE_RPID_CONFLICT = "RP ID already exists.";
        public const string SERVICE_RPID_UAT_CONFLICT = "RP ID (UAT) already exists.";
    }
}
