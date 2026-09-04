using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Features.ManageAccess.V1;
using AccessedServices.Data;
using GoA.UiamRpClientLib.Identity;
using Libs.Auth;
using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class IsAdminUser : IMinimalEndpoint
    {
        public record GetIsAdminUserDto(bool isAdmin);
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/is-admin",
            async (HttpContext httpContext, ILogger<string> logger, IAdminUserRepository repo, CancellationToken cancellationToken) =>
            {
                User? user = httpContext.User as User;
                if (user != null)
                {
                    var adminUser = await repo.GetByIdAsync(user.PrimaryEmailAddress, new Microsoft.Azure.Cosmos.PartitionKey(user.PrimaryEmailAddress));
                    if (adminUser!=null && adminUser.IsActive)
                    {
                        return Results.Ok(new GetIsAdminUserDto(true));
                    }
                }
                return Results.Ok(new GetIsAdminUserDto(false));
            })
            .RequireAuthorization()
            .WithName("isAdminUser")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<GetIsAdminUserDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return if user is admin or not")
            .WithDescription("Check if user is admin")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
