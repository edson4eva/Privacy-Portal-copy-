//using System.Net.Http;
//using System.Net.Http.Headers;
//using System.Net.Http.Json;
//using System.Text.Json;
//using Complaints.Complaints.Dtos;
//using Complaints.Data;
//using FluentValidation;
//using GoA.UiamRpClientLib.Authentication;
//using GoA.UiamRpClientLib.DataAccess;
//using GoA.UiamRpClientLib.Security;
//using GoA.UiamRpClientLib.Settings;
//using Libs.Auth;
//using Libs.Web;
//using Mapster;
//using MapsterMapper;
//using MediatR;
//using Microsoft.AspNetCore.Builder;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Routing;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Extensions.Logging;

//namespace Complaints.Complaints.Features.GettingComplaints.V1
//{
//    public record GetAccessLogOfUser() : IRequest<GetAccessLogOfUserResult>;

//    public record GetAccessLogOfUserResult(List<SsoSessionAudit> accessLog);

//    public record GetAccessLogOfUserResponseDto(List<SsoSessionAudit> accessLog);

//    public class GetAccessLog : IMinimalEndpoint
//    {
//        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
//        {
//            builder.MapGet($"{EndpointConfig.BaseApiPath}/access-log",
//            async (IMediator mediator, IMapper mapper, CancellationToken cancellationToken) =>
//                {
//                    var result = await mediator.Send(new GetAccessLogOfUser(), cancellationToken);

//                    var response = result.Adapt<GetAccessLogOfUserResponseDto>();

//                    return Results.Ok(response);
//                })
//            .RequireAuthorization()
//            .WithName("GetAccessLog")
//            .WithApiVersionSet(builder.NewApiVersionSet("AccessLog").Build())
//            .Produces<GetAccessLogOfUserResponseDto>()
//            .ProducesProblem(StatusCodes.Status400BadRequest)
//            .WithSummary("Get Complaints by User ID")
//            .WithDescription("Get Complaints by User ID")
//            .WithOpenApi()
//            .HasApiVersion(1.0)
//            .RequireCors();

//            return builder;
//        }
//    }

//    public class GetAccessLogOfUserValidator : AbstractValidator<GetAccessLogOfUser>
//    {
//        public GetAccessLogOfUserValidator()
//        {
//        }
//    }

//    internal class GetAccessLogOfUserHandler : IRequestHandler<GetAccessLogOfUser, GetAccessLogOfUserResult>
//    {
//        private readonly ILogger<string> _logger;
//        private readonly IUiamDataApiFactory _dataApiFactory;
//        private readonly IUiamApplicationSession _uiamAppSession;
//        private readonly IConfiguration _configuration;

//        public GetAccessLogOfUserHandler(ILogger<string> logger, IUiamDataApiFactory dataApiFactory,
//            IConfiguration configuration, IUiamApplicationSession uiamAppSession)
//        {
//            _logger = logger;
//            _dataApiFactory = dataApiFactory;
 
//            _uiamAppSession = uiamAppSession;
//            _configuration = configuration;
//        }
//        public async Task<GetAccessLogOfUserResult> Handle(GetAccessLogOfUser request, CancellationToken cancellationToken)
//        {
//            var jwtSettings = _configuration.GetSection("JwtSettings").Get<List<JwtSettings>>();
//            var privacyLogJwt = jwtSettings?.FirstOrDefault(x => x.Name == "privacy-log");
//            if (privacyLogJwt == null)
//            {
//                throw new Exception("Jwt not configured in appsettings.json");
//            }
//            var dataApi = _dataApiFactory.CreateUiamDataApiClient();
//            dataApi.UiamApplicationSession = _uiamAppSession;
//            var accessToken = await dataApi.GetAccessToken(
//                privacyLogJwt.Issuer,
//                privacyLogJwt.Audience,
//                []);

//            var result = await GetAccessLogAction(accessToken);



//            //https://sit.account.alberta.ca/api/v1/account/sso-session-audit?RelyingPartyIds=x122323&RelyingPartyIds=string&AccessLogLimit=5

//            return new GetAccessLogOfUserResult(result);
//        }


//        public async Task<dynamic> GetAccessLogAction(string accessToken)
//        {
//            var queryParameters = "RelyingPartyIds=13a450fa-450d-4949-b535-5d5995cd4178&AccessLogLimit=5";

//            var queryString = "v1/account/sso-session-audit?" + queryParameters;

//            var httpClient = new HttpClient();
//            httpClient.BaseAddress = new Uri("https://sit.account.alberta.ca/api-syst/data/api/");//_customSettings?.DataApiServerUri);
//            //https://sit.account.alberta.ca/api-syst/data/api/v1/account/sso-session-audit

//            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
//            var rawResponse = await httpClient.GetStringAsync("https://sit.account.alberta.ca/api-syst/data/api/v1/account/sso-session-audit?RelyingPartyIds=13a450fa-450d-4949-b535-5d5995cd4178&AccessLogLimit=5");

//            //var rawResponse = await httpClient.GetAsync(queryString);
//            //rawResponse.EnsureSuccessStatusCode();
//            ////var data = await rawResponse.Content.ReadAsStringAsync();

//            //var response = await rawResponse.Content.ReadFromJsonAsync<JsendResponse<List<SsoSessionAudit>>>(_jsonSerializerOptions);


//            return rawResponse;

//            //var response = await rawResponse.Content.ReadFromJsonAsync<JsendResponse<List<SsoSessionAudit>>>(_jsonSerializerOptions);
//            //if (response != null)
//            //{
//            //    return response.Data;
//            //}
//            //return null;
//        }

//        private readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
//        {
//            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
//        };
//    }

//    internal class JsendResponse<T>
//    {
//        public T Data { get; set; }
//    }
//}
