using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.Data;
using GoA.UiamRpClientLib.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using static AccessedServices.AccessedServices.Features.Admin.V1.IsAdminUser;

namespace AccessedServices.AccessedServices.Services
{
    public class AdminRoleRequirementHandler : AuthorizationHandler<AdminRoleRequirement>
    {
        private readonly IAdminUserRepository _adminUserRepository;
        public AdminRoleRequirementHandler(IAdminUserRepository adminUserRepository)
        {
            _adminUserRepository = adminUserRepository;
        }
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminRoleRequirement requirement)
        {
            User? user = context.User as User;
            if (user!=null)
            {
                var adminUser = await _adminUserRepository.GetByIdAsync(user.PrimaryEmailAddress, new Microsoft.Azure.Cosmos.PartitionKey(user.PrimaryEmailAddress));
                if (adminUser != null && adminUser.IsActive)
                {
                    context.Succeed(requirement);
                }
            }
            else
            {
                context.Fail();
            }
        }
    }
}
