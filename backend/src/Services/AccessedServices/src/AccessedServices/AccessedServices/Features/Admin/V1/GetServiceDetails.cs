using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Features.GettingAccessedServiceDetails.V1;
using AccessedServices.AccessedServices.Features.GettingAccessedServices.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using static AccessedServices.AccessedServices.Features.Admin.V1.GetServicesList;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record GetServiceDetailsRequest(string ServiceId) : IRequest<GetServiceDetailsResult>;
    public record Entry(string key, string value);
    public record GetServiceDetailsResult(ServiceDetailDto serviceDetails);
    public class GetServiceDetails : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/services/{{ServiceId}}",
            async (string ServiceId, HttpContext httpContext, ILogger<GetServiceDetails> logger, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new GetServiceDetailsRequest(ServiceId));
                return Results.Ok(result);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("GetServiceDetails")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<GetServiceDetailsResult>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return the service details for the given service id")
            .WithDescription("Get the service details for the given service id")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class GetServicesDetailsHandler : IRequestHandler<GetServiceDetailsRequest, GetServiceDetailsResult>
    {
        private readonly IDraftServiceRepository _repository;
        public GetServicesDetailsHandler(IDraftServiceRepository repository)
        {
            this._repository = repository;
        }
        public async Task<GetServiceDetailsResult> Handle(GetServiceDetailsRequest request, CancellationToken cancellationToken)
        {
            var service = await _repository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }
            var dto = service.Adapt<ServiceDetailDto>();
            if (!string.IsNullOrWhiteSpace(dto.CategoryId) && Categories.Items.TryGetValue(dto.CategoryId, out string? catVal))
            {
                dto.CategoryText = catVal;
            }
            if (dto.DataOwnerIds != null && dto.DataOwnerIds.Count > 0)
            {
                dto.DataOwnerTexts = dto.DataOwnerIds.Select(id => Ministries.Items.TryGetValue(id, out string? text) ? text : id).ToList();
            }
            else if (service.DataOwnerId != null)
            {
                var text = Ministries.Items.TryGetValue(service.DataOwnerId, out string? datVal) ? datVal : null;
                if (text != null)
                {
                    dto.DataOwnerIds = [ service.DataOwnerId ];
                    dto.DataOwnerTexts = [text];
                }
            }
            return new GetServiceDetailsResult(dto);
        }
    }
}