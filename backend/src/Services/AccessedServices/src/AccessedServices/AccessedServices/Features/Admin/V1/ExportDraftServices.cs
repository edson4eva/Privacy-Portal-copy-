using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Libs.Audit;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using static Microsoft.FSharp.Core.ByRefKinds;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class ExportDraftServices : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/drafts/export", async (IDraftServiceRepository repo, IAuditLogService auditLogService, IMapper mapper, CancellationToken cancellationToken) =>
            {
                var mimeType = "application/json";
                var filename = $"draft-services-{DateTime.Now.ToString("yyyy-MM-dd-HH-mm-ss")}.json";

                var services = (await repo.GetAllAsync()).ToList();
                var body = JsonConvert.SerializeObject(services, Formatting.Indented);
                var content = Encoding.UTF8.GetBytes(body);

                return Results.File(content, mimeType, filename);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("ExportDraftServices")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Export services as JSON")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
}
