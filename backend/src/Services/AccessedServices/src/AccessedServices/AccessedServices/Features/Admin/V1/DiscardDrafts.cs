using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using FluentValidation;
using Libs.Web;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using MapsterMapper;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Serialization.HybridRow.Schemas;
using Microsoft.Extensions.Logging;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record DiscardDraftsResult(bool bSuccess);
    public record DiscardDrafts() : IRequest<DiscardDraftsResult>;

    public class DiscardDraftsEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/services/discarddrafts",
                async (HttpContext httpContext
                ,IMapper mapper
                    , ILogger<DiscardDraftsEndpoint> logger
                    , IMediator mediator
                    , CancellationToken cancellationToken) =>
                {

                    var result = await mediator.Send(new DiscardDrafts());
                    return Results.Ok(result.bSuccess);
                })
                .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
                .WithName("discardchanges")
                .WithApiVersionSet(builder.NewApiVersionSet("Publish").Build())
                .Produces<Service>()
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .WithSummary("Discard Drafts")
                .WithDescription("Discard Drafts and copy from Services")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class DiscardDraftsHandler : IRequestHandler<DiscardDrafts, DiscardDraftsResult>
    {

        private readonly IDraftServiceRepository _draftserviceRepo;
        private readonly IServiceRepository _serviceRepo;
        private readonly IMapper _mapper;


        public DiscardDraftsHandler(IMapper mapper, IDraftServiceRepository draftserviceRepository, IServiceRepository serviceRepo)
        {
            _draftserviceRepo = draftserviceRepository;
            _mapper = mapper;
            _serviceRepo = serviceRepo;
        }

        public async Task<DiscardDraftsResult> Handle(DiscardDrafts request, CancellationToken cancellationToken)
        {
            bool success = false;
            success = await _draftserviceRepo.DeleteAllAsync();

            var services = await _serviceRepo.GetAllAsync();
            var draftservices = services.Select(services => _mapper.Map<DraftService>(services)).ToList();
            
            foreach (var draft in draftservices)
            {
                await _draftserviceRepo.AddAsync(draft, new Microsoft.Azure.Cosmos.PartitionKey(draft.Id));
            }
            success = true;

            return new DiscardDraftsResult(success);
        }
    }
}
