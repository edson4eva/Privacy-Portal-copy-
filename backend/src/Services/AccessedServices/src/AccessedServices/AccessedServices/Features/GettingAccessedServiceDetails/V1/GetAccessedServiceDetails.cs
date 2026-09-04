using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Features.GettingAccessedServices.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.GettingAccessedServiceDetails.V1
{
    public record GetAccessedServiceDetails(string UserId, string ServiceId) : IRequest<GetAccessedServiceDetailsResult>;
    public record GetAccessedServiceDetailsResult(GetAccessedServiceDetailsDto AccessedServiceDetails);
    public record GetAccessedServiceDetailsResponseDto(GetAccessedServiceDetailsDto AccessedServiceDetails);
    public class GetAccessedServiceDetailsEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/accessed-services/{{ServiceId}}",
            async (string ServiceId, HttpContext httpContext, ILogger<GetAccessedServicesEndpoint> logger, IMediator mediator, IMapper mapper, CancellationToken cancellationToken) =>
            {
                var user = httpContext.User as GoA.UiamRpClientLib.Identity.User;
                if (user == null)
                {
                    throw new InvalidOperationException("Couldn't resolve user.");
                }

                if (user.PrimaryEmailAddress == null)
                {
                    throw new InvalidOperationException("Couldn't resolve email address.");
                }

                if (!user.IsVerified())
                {
                    throw new InvalidOperationException("User is not verified");
                }

                var result = await mediator.Send(new GetAccessedServiceDetails(user.PrimaryEmailAddress, ServiceId));
                var response = result.Adapt<GetAccessedServiceDetailsResponseDto>();
                return Results.Ok(response);
            })
            .RequireAuthorization()
            .WithName("GetAccessedServiceDetails")
            .WithApiVersionSet(builder.NewApiVersionSet("AccessedServices").Build())
            .Produces<GetAccessedServiceDetailsResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Get Accessed Service Details by Service Id")
            .WithDescription("Get Accessed Service Details by Service Id")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class GetAccessedServicesDetailsHandler : IRequestHandler<GetAccessedServiceDetails, GetAccessedServiceDetailsResult>
    {
        private readonly IAccessLogService _accessLogService;
        private readonly IServiceRepository _serviceRepository;
        public GetAccessedServicesDetailsHandler(IAccessLogService accessLogService, IServiceRepository serviceRepository)
        {
            _accessLogService = accessLogService;
            _serviceRepository = serviceRepository;
        }
        public async Task<GetAccessedServiceDetailsResult> Handle(GetAccessedServiceDetails request, CancellationToken cancellationToken)
        {
            var service = await _serviceRepository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }
            var accessedServicesResult = await _accessLogService.GetUserAccessedServicesAsync(request.UserId);
            var selectedAccessedService = accessedServicesResult.AccessedServices.FirstOrDefault(_ => _.Id == request.ServiceId);
            if (selectedAccessedService == null)
            {
                throw new ServiceNotFoundException();
            }
            var details = service.Adapt<ServiceDetailDto>();
            if (!string.IsNullOrEmpty(details.CategoryId) && Categories.Items.TryGetValue(details.CategoryId, out string? catVal))
            {
                details.CategoryText = catVal;
            }
            /*
            if (!string.IsNullOrEmpty(details.DataOwnerId) && Ministries.Items.TryGetValue(details.DataOwnerId, out string? datVal))
            {
                details.DataOwnerText = datVal;
            }*/
            if (details.DataOwnerIds != null && details.DataOwnerIds.Count > 0)
            {
                details.DataOwnerTexts = details.DataOwnerIds.Select(id => Ministries.Items.TryGetValue(id, out string? text) ? text : id).ToList();
            }
            var accessedServiceDetailsDto = new GetAccessedServiceDetailsDto()
            {
                AccessedDates = selectedAccessedService.AccessedDates,
                ServiceDetails = details
            };
            return new GetAccessedServiceDetailsResult(accessedServiceDetailsDto);
        }
    }
}
