using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using Dapr.Client;
using FluentValidation;
using Libs.Web;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Features.GettingAccessedServices.V1
{
    public record LoadEServicesAccessedDataByUserId(string UserId) : IRequest;
    internal record GetEServicesAccessedDataByUserIdResult(GetUserHistoryApiResponse response);

    public class LoadEServicesData : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/user/load-eservices-data",
                async (HttpContext httpContext,
                ILogger<LoadEServicesData> logger,
                IConfiguration configuration,
                IMediator mediator,
                CancellationToken cancellationToken) =>
                {
                    //var userId = httpContext.User.Claims.FirstOrDefault(_ => _.Type == "preferred_username")?.Value;
                    var userId = "d58e2a499fef7d4020bc3ab888eb16f9762cc2eb0bb8c2f96ce9d39622a128a";

                    if (string.IsNullOrEmpty(userId))
                    {
                        return Results.Problem("User not authenticated", null, StatusCodes.Status401Unauthorized);
                    }

                    await mediator.Send(new LoadEServicesAccessedDataByUserId(userId), cancellationToken);

                    return Results.Ok();
                })
            .RequireAuthorization()
            .WithName(nameof(LoadEServicesData))
            .WithApiVersionSet(builder.NewApiVersionSet("AccessedServices").Build())
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Load eservices data")
            .WithDescription("Check the cache and, if empty, hydrate with user data from eServices")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    public class LoadEServicesAccessedDataByUserIdValidator : AbstractValidator<LoadEServicesAccessedDataByUserId>
    {
        public LoadEServicesAccessedDataByUserIdValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required!");
        }
    }

    internal class LoadEServicesAccessedDataByUserIdHandler : IRequestHandler<LoadEServicesAccessedDataByUserId>
    {
        private readonly IEServicesDataApi api;
        private readonly IConfiguration configuration;
        private readonly DaprClient _daprClient;

        public LoadEServicesAccessedDataByUserIdHandler(IEServicesDataApi api, IConfiguration configuration, DaprClient client)
        {
            this.api = api;
            this.configuration = configuration;
            this._daprClient = client;
        }

        public async Task Handle(LoadEServicesAccessedDataByUserId request, CancellationToken cancellationToken)
        {
            GetUserHistoryApiResponse response;
            var DAPR_STORE_NAME = configuration["StateStore:EServicesStateName"];
            var maxItemLifeTimeInSeconds = configuration.GetValue<int>("StateStore:MaxItemLifeTimeInSeconds");

            if (maxItemLifeTimeInSeconds <= 0)
            {
                maxItemLifeTimeInSeconds = 60;
            }

            if (string.IsNullOrEmpty(DAPR_STORE_NAME))
            {
                throw new Exception("Invalid store configuration");
            }

            var state = await _daprClient.GetStateEntryAsync<GetUserHistoryApiResponse>(DAPR_STORE_NAME, request.UserId);

            if (state != null)
            {
                response = state.Value;

                // if the cache contains a valid object, and it has data, then fast exit
                if (response != null && response.Products != null && response.Products.Any())
                {
                    return;
                }
            }

            // if the cache is empty, or the data is invalid, then hydrate the cache
            response = await this.GetUserHistory(request.UserId, Guid.NewGuid().ToString());

            await _daprClient.SaveStateAsync(DAPR_STORE_NAME, request.UserId, response, metadata: new Dictionary<string, string> {
                { "ttlInSeconds", maxItemLifeTimeInSeconds.ToString() }
            });
        }

        public async Task<string> GetToken(string username, string password)
        {
            var response = await this.SendRequest<string>(() => this.api.GetAuthorizationToken(new GetTokenRequest(username, password)));

            return response;
        }

        public async Task<GetUserHistoryApiResponse> GetUserHistory(string userId, string requestId, int accessLogLimit = 5)
        {
            var token = await this.GetToken(this.configuration["EServices:Username"], this.configuration["EServices:Password"]);

            var headers = new Dictionary<string, string>
            {
                ["Authorization"] = $"Bearer {token}"
            };

            var response = await this.SendRequest<string>(() => this.api.GetUserHistory(
                new GetUserHistoryRequest(
                    userId,
                    requestId,
                    DateTime.UtcNow.ToString("yyyy-MM-dd HH:00:00"),
                    accessLogLimit
                ),
                headers)
            );

            var result = response.Deserialize<GetUserHistoryApiResponse>();

            return result;
        }

        public async Task<T> SendRequest<T>(Func<Task<HttpResponseMessage>> action)
        {
            var response = await action();
            var s = await response.Content.ReadAsStringAsync();

            response.EnsureSuccessStatusCode();

            return s.Deserialize<T>();
        }
    }
}
