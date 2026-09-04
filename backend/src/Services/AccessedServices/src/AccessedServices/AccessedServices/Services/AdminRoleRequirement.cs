using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace AccessedServices.AccessedServices.Services
{
    public class AdminRoleRequirement: IAuthorizationRequirement
    {
        public const string ADMIN_POLICY = "ADMIN";
    }
}
