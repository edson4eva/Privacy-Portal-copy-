using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Libs.Audit;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos.Core;
using Newtonsoft.Json;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record ImportDraftServices(List<DraftService> services) : IRequest<ImportDraftResultDto> { }
    public record ImportDraftResultDto(List<string> names);
    public class ImportDraftServicesEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/drafts/import", async (HttpRequest req, IMediator mediator,
                IDraftServiceRepository repo, IAuditLogService auditLogService, IMapper mapper, CancellationToken cancellationToken) =>
            {
                using var reader = new StreamReader(req.Body);

                var json = await reader.ReadToEndAsync();
                var services = JsonConvert.DeserializeObject<List<DraftService>>(json);
                var command = new ImportDraftServices(services);
                var result = await mediator.Send(command);
                return Results.Ok(result);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("ImportDraftServices")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<IResult>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Import Draft services")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
    internal class ImportDraftsCommandHandler : IRequestHandler<ImportDraftServices, ImportDraftResultDto>
    {
        private readonly IDraftServiceRepository _repo;

        public ImportDraftsCommandHandler(IDraftServiceRepository serviceRepository)
        {
            _repo = serviceRepository;
        }

        public async Task<ImportDraftResultDto> Handle(ImportDraftServices request, CancellationToken cancellationToken)
        {
            var names = new List<string>();
            foreach (var service in request.services)
            {
                await _repo.UpdateAsync(service, new Microsoft.Azure.Cosmos.PartitionKey(service.Id));
                names.Add(service.Id);
            }
            return new ImportDraftResultDto(names);
        }
    }
}
