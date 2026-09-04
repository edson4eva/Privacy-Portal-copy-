using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Dapr.Client;
using FluentValidation;
using GoA.UiamRpClientLib.Helpers;
using GoA.UiamRpClientLib.Identity;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.GettingAccessedServices.V1
{
    public record GetAccessedServices(string UserId) : IRequest<GetAccessedServicesResult>;
    public record GetAccessedServicesResult(bool IsStale, IEnumerable<GetAccessedServiceDto> AccessedServices);
    public record GetAccessedServicesResponseDto(bool IsStale, IEnumerable<GetAccessedServiceDto> AccessedServices);
    public class GetAccessedServicesEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/accessed-services",
                async (HttpContext httpContext,
                ILogger<GetAccessedServicesEndpoint> logger,
                IMediator mediator,
                CancellationToken cancellationToken) =>
                {
                    var user = (httpContext.User as User);
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
                        throw new InvalidOperationException("User is not verified.");
                    }
                    var result = await mediator.Send(new GetAccessedServices(user.PrimaryEmailAddress));
                    var response = result.Adapt<GetAccessedServicesResponseDto>();
                    return Results.Ok(response);
                })
            .RequireAuthorization()
            .WithName("GetAccessedServices")
            .WithApiVersionSet(builder.NewApiVersionSet("AccessedServices").Build())
            .Produces<IList<GetAccessedServicesResponseDto>>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Get Accessed Services by User ID")
            .WithDescription("Returns any items found within the state store for the specificed user")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class GetAccessedServicesHandler : IRequestHandler<GetAccessedServices, GetAccessedServicesResult>
    {
        private readonly IAccessLogService _accessLogService;
        public GetAccessedServicesHandler(IAccessLogService accessLogService)
        {
            _accessLogService = accessLogService;
        }

        public async Task<GetAccessedServicesResult> Handle(GetAccessedServices request, CancellationToken cancellationToken)
        {
            var accessedServicesResult = await _accessLogService.GetUserAccessedServicesAsync(request.UserId);
            var result = accessedServicesResult.AccessedServices.Select(service => new GetAccessedServiceDto()
            {
                Id = service.Id,
                ServiceName = service.Name,
                IsAvailable = service.IsAvailable,
                LastAccessedOn = service.AccessedDates.First(),
                CategoryId = service.Category,
            });

            return new GetAccessedServicesResult(accessedServicesResult.IsUIAMStale || accessedServicesResult.IsEServiceStale, result);
        }
    }
}
