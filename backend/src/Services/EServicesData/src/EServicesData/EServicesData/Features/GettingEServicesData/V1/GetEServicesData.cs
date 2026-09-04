using Refit;
using Libs.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using MediatR;
using MapsterMapper;
using Mapster;
using FluentValidation;
using Microsoft.Extensions.Configuration;

namespace EServicesData.EServicesData.Features.GettingEServicesData.V1
{

    public record GetUserHistoryByUserId(string UserId) : IRequest<GetUserHistoryByUserIdResult>;
    public record GetUserHistoryByUserIdResult(GetUserHistoryResponse response);

    public class GetEServicesData : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/user/history",
            async (IMediator mediator, ILogger<GetEServicesData> logger, CancellationToken cancellationToken) =>
            {
                var userId = "d58e2a499fef7d4020bc3ab888eb16f9762cc2eb0bb8c2f96ce9d39622a128a";

                var result = await mediator.Send(new GetUserHistoryByUserId(userId), cancellationToken);

                // should this result be transformed here to a dto before returning to the client?
                return Results.Ok(result);
            })
            //.RequireAuthorization()
            .WithName("GetUserHistory")
            .WithApiVersionSet(builder.NewApiVersionSet("EServices").Build())
            .Produces<GetUserHistoryByUserIdResult>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Get User History from eServices by User ID")
            .WithDescription("Get User History from eServices by User ID")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
    public class GetUserHistoryByUserIdValidator : AbstractValidator<GetUserHistoryByUserId>
    {
        public GetUserHistoryByUserIdValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required!");
        }
    }

    internal class GetUserHistoryByUserIdHandler : IRequestHandler<GetUserHistoryByUserId, GetUserHistoryByUserIdResult>
    {
        private readonly IEServicesDataApi api;
        private readonly IConfiguration configuration;
        private readonly ILogger logger;

        public GetUserHistoryByUserIdHandler(IEServicesDataApi api, IConfiguration configuration, ILogger<GetUserHistoryByUserIdHandler> logger)
        {
            this.api = api;
            this.configuration = configuration;
            this.logger = logger;
        }

        public async Task<GetUserHistoryByUserIdResult> Handle(GetUserHistoryByUserId request, CancellationToken cancellationToken)
        {
            var response = await this.GetUserHistory(request.UserId, Guid.NewGuid().ToString());

            return new GetUserHistoryByUserIdResult(response);
        }

        public async Task<string> GetToken(string username, string password)
        {
            var response = await this.SendRequest<string>(() => this.api.GetAuthorizationToken(new GetTokenRequest
            {
                Username = username,
                Password = password
            }));

            return response;
        }

        public async Task<GetUserHistoryResponse> GetUserHistory(string userId, string requestId, int accessLogLimit = 5)
        {
            var token = await this.GetToken(this.configuration["EServices:Username"], this.configuration["EServices:Password"]);

            var headers = new Dictionary<string, string>
            {
                ["Authorization"] = $"Bearer {token}"
            };

            var response = await this.SendRequest<string>(() => this.api.GetUserHistory(new GetUserHistoryRequest
            {
                UserId = userId,
                RequestId = requestId,
                AccessLogLimit = accessLogLimit,
                RequestDateTime = DateTime.UtcNow
            }, headers));

            var result = response.Deserialize<GetUserHistoryResponse>();

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
    public interface IEServicesDataApi
    {
        [Post("/privacy-portal")]
        Task<HttpResponseMessage> GetUserHistory(GetUserHistoryRequest request, [HeaderCollection] IDictionary<string, string> headers);

        [Post("/integration/admin/token")]
        Task<HttpResponseMessage> GetAuthorizationToken(GetTokenRequest request);
    }

    public class GetUserHistoryRequest
    {
        public string UserId { get; set; }
        public string RequestId { get; set; }
        public int AccessLogLimit { get; set; } = 5;
        public DateTime RequestDateTime { get; set; }
    }

    public class GetTokenRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class GetUserHistoryResponse
    {
        public string UserId { get; set; }
        public DateTime RequestDateTime { get; set; }
        public DateTime ResponseDateTime { get; set; }
        public bool IsUserValid { get; set; }
        public IList<Product> Products { get; set; } = new List<Product>();
    }

    public class Product
    {
        public string Name { get; set; }
        public string Sku { get; set; }
        public string AccessLogs { get; set; }
    }
}
