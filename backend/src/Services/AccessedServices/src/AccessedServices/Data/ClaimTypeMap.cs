using AccessedServices.AccessedServices.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data
{
    public static class ClaimTypeMap
    {
        private static class ClaimCategory
        {
            public const string Name = "Name";
            public const string DateOfBirth = "Date of birth";
            public const string MailingAddress = "Mailing address";
        }
        public static Dictionary<string, string> Claims { get; } = new Dictionary<string, string>
        {
            { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname", ClaimCategory.Name },
            { "http://identity.alberta.ca/middlename", ClaimCategory.Name },
            { "http://identity.alberta.ca/othermiddlenames", ClaimCategory.Name },
            { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/dateofbirth", ClaimCategory.DateOfBirth },
            { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/streetaddress", ClaimCategory.MailingAddress },
            { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/streetaddress2", ClaimCategory.MailingAddress },
            { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality", ClaimCategory.MailingAddress }
        };
    }
}
