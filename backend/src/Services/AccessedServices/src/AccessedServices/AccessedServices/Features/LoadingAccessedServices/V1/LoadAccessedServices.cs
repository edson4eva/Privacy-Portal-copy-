using AccessedServices.AccessedServices.Services;
using Libs.Web;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.LoadingAccessedServices.V1
{
    public record LoadAccessedServicesRequest(string UserId) : IRequest<Unit>;
    public class LoadAccessedServices : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/load-accessed-services",
                (HttpContext httpContext,
                ILogger<LoadAccessedServices> logger,
                IMediator mediator,
                CancellationToken cancellationToken) =>
                {
                    var userId = httpContext.User.Claims.FirstOrDefault(_ => _.Type == "preferred_username")?.Value;
                    if (userId == null)
                    {
                        throw new InvalidOperationException("Couldn't resolve UserId");
                    }
                    logger.LogInformation("Accessed services list loaded by {userId}", userId);
                    _ = mediator.Send(new LoadAccessedServicesRequest(userId));//Not awaiting
                    return Results.Ok();
                })
            .RequireAuthorization()
            .WithName("LoadAccessedServices")
            .WithApiVersionSet(builder.NewApiVersionSet("AccessedServices").Build())
            .Produces(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Load Accessed Services for user")
            .WithDescription("This will populate the cache with user's accessed services")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }

        internal class LoadAccessedServicesRequestHandler : IRequestHandler<LoadAccessedServicesRequest, Unit>
        {
            private readonly IAccessLogService _accessLogService;
            private readonly ILogger<LoadAccessedServicesRequestHandler> _logger;
            public LoadAccessedServicesRequestHandler(IAccessLogService accessLogService, ILogger<LoadAccessedServicesRequestHandler> logger)
            {
                _accessLogService = accessLogService;
                _logger = logger;
            }

            public async Task<Unit> Handle(LoadAccessedServicesRequest request, CancellationToken cancellationToken)
            {
                try
                {
                    await _accessLogService.GetUserAccessedServicesAsync(request.UserId);
                    _logger.LogInformation("Loaded accessed services for {UserId}", request.UserId);
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error while loading accessed services for {UserId}: {ErrorMessage}", request.UserId, ex.Message);
                }

                return Unit.Value;
            }
        }
    }
}
