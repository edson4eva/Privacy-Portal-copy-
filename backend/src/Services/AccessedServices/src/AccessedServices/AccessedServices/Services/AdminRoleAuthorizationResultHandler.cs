using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;

namespace AccessedServices.AccessedServices.Services
{
    public class AdminRoleAuthorizationResultHandler : IAuthorizationMiddlewareResultHandler
    {
        private readonly AuthorizationMiddlewareResultHandler defaultHandler = new AuthorizationMiddlewareResultHandler();
        public async Task HandleAsync(RequestDelegate next, HttpContext context, AuthorizationPolicy policy, PolicyAuthorizationResult authorizeResult)
        {
            if (authorizeResult.Challenged
                && !authorizeResult.Succeeded
                && policy.Requirements.Any(req => req is AdminRoleRequirement))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }
            await defaultHandler.HandleAsync(next, context, policy, authorizeResult);
        }
    }
}
