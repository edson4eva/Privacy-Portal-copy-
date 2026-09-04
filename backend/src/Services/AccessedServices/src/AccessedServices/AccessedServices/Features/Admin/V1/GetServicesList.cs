using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using GoA.UiamRpClientLib.Identity;
using Libs.Web;
using Mapster;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class GetServicesList : IMinimalEndpoint
    {
        public record GetServicesListResult(IEnumerable<ServiceDto> services);
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/services",
            async (HttpContext httpContext, ILogger<string> logger, IDraftServiceRepository repo) =>
            {
                var services = await repo.GetDraftServicesOrderedByTimestampDesc();
                var result = services.Select(x =>
                {
                    var dto = x.Adapt<ServiceDto>();
                    dto.HasServiceDetails = x.IsAvailable;
                    return dto;
                });
                return Results.Ok(new GetServicesListResult(result));
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("GetServices")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<GetServicesListResult>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return list of draft services")
            .WithDescription("Get the list of draft services in the portal")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
