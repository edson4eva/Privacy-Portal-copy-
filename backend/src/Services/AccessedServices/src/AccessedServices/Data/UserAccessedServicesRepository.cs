using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.AccessedServices.Models;
using GoA.UiamRpClientLib.Authentication;
using GoA.UiamRpClientLib.Context;
using GoA.UiamRpClientLib.DataAccess;
using GoA.UiamRpClientLib.DataAccess.Args;
using GoA.UiamRpClientLib.Identity;
using Libs.Audit;
using Libs.Web;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AccessedServices.Data
{
    #region SsoSessionAudit DTO
    internal class AccessLog
    {
        public required DateTime LoginTime { get; set; }
        public int ClaimAttributeId { get; set; }
    }
    internal class RelyingParty
    {
        public required string Id { get; set; }
        public required AccessLog[] AccessLogs { get; set; }
    }
    internal class ClaimAttribute
    {
        public int Id { get; set; }
        public required string Attributes { get; set; }
    }
    internal class AuditData
    {
        public required ClaimAttribute[] ClaimAttributes { get; set; }
        public required RelyingParty[] RelyingParties { get; set; }
    }
    internal class SsoSessionAudit
    {
        public required string Status { get; set; }
        public required AuditData Data { get; set; }
        public string? message { get; set; }

    }
    #endregion SsoSessionAudit DTO

    internal class UIAMJwtSettings
    {
        public required string Name { get; set; }
        public required string Audience { get; set; }
        public required string Issuer { get; set; }
    }

    public class UserAccessedServicesRepository : IUserAccessedServicesRepository
    {
        private readonly IEServicesDataApi _api;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly string _eServicesUsername;
        private readonly string _eServicesPassword;
        private readonly string _uiamDataApiUri;
        private readonly IUiamDataApi _dataApi;
        private readonly ITokenCookie _tokenCookie;
        private readonly IClientAuditFactory _clientAuditFactory;
        private readonly ICurrentRequest _currentRequest;
        private readonly UIAMJwtSettings _uiamJwtSettings;
        private readonly IAuditLogService _auditLogService;
        private readonly HttpClient _httpClient;

        private const string ESERVICES_USERNAME_KEY = "AccessedServicesOptions:EServiceOptions:Username";
        private const string ESERVICES_PASSWORD_KEY = "AccessedServicesOptions:EServiceOptions:Password";
        private const string UIAM_DATA_API_SERVER_URI = "UiamSettings:DataApiServerUrl";

        public UserAccessedServicesRepository(IEServicesDataApi api
            , IConfiguration configuration
            , ILogger<UserAccessedServicesRepository> logger
            , IUiamDataApi dataApi
            , ITokenCookie tokenCookie
            , IClientAuditFactory clientAuditFactory
            , ICurrentRequest currentRequest
            , IAuditLogService auditLogService
            , HttpClient httpClient
            )
        {
            _api = api;
            _configuration = configuration;
            _logger = logger;
            _dataApi = dataApi;
            _tokenCookie = tokenCookie;
            _clientAuditFactory = clientAuditFactory;
            _currentRequest = currentRequest;
            _auditLogService = auditLogService;
            _httpClient = httpClient;

            _eServicesUsername = _configuration[ESERVICES_USERNAME_KEY]
                             ?? throw new InvalidOperationException("eService user name is not configured.");
            _eServicesPassword = _configuration[ESERVICES_PASSWORD_KEY]
                             ?? throw new InvalidOperationException("eService password is not configured.");
            _uiamDataApiUri = _configuration[UIAM_DATA_API_SERVER_URI]
                             ?? throw new InvalidOperationException("UIAM data server api uri is not configured.");
            _uiamJwtSettings = _configuration.GetSection("UIAMJwtSettings").Get<UIAMJwtSettings>()
                             ?? throw new InvalidOperationException("UIAM Jwt not configured.");
        }

        public async Task<GetUserHistoryApiResponse?> GetUserAccessedEServicesAsync(string userId, string requestId, int accessLogLimit = 5)
        {
            var token = await this.GetToken(_eServicesUsername, _eServicesPassword);
            if (token == null)
            {
                _logger.LogError("Failed to retrieve authorization token for user {UserName} from eServices. Please check the username/password or service availability.", _eServicesUsername);
                return null;
            }

            var headers = new Dictionary<string, string>
            {
                ["Authorization"] = $"Bearer {token}"
            };
            var requestDateTime = DateTime.UtcNow.ToString("yyyy-MM-dd HH:00:00");
            var response = await this.SendRequest(() => this._api.GetUserHistory(
                new GetUserHistoryRequest(
                    userId,
                    requestId,
                    requestDateTime,
                    accessLogLimit
                ),
                headers)
            );

            if (response == null)
            {
                _logger.LogError("No eServices data found for UserId: {UserId}, RequestId: {RequestId}, RequestDateTime: {RequestDateTime}, AccessLogLimit: {AccessLogLimit}. This may indicate service unavailability, or an issue with the provided parameters.",
                           userId, requestId, requestDateTime, accessLogLimit);
                return null;
            }

            var result = response.Deserialize<GetUserHistoryApiResponse>();
            _auditLogService.LogRead(ServiceCategory.AccountHistory, "GetEServices", new { email = userId, requestId, requestDateTime, accessLogLimit }, response);
            return result;
        }
        private async Task<string?> GetToken(string username, string password)
        {
            var response = await this.SendRequest(() => this._api.GetAuthorizationToken(new GetTokenRequest(username, password)));

            return response;
        }
        private async Task<string?> SendRequest(Func<Task<HttpResponseMessage>> action)
        {
            var response = await action();
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Request to {RequestUri} failed with status code {StatusCode}. Response content: {ResponseContent}. Method: {Method}",
                    response.RequestMessage?.RequestUri, response.StatusCode, responseContent, response.RequestMessage?.Method);
            }

            return response.IsSuccessStatusCode ? responseContent.Deserialize<string>() : null;
        }

        public async Task<IEnumerable<UIAMData>> GetUserAccessedUIAMDataAsync(string[] relyingPartyIDs, int accessLogLimit = 5)
        {
            var ssoSessionAudit = await GetSsoSessionAudit(relyingPartyIDs, accessLogLimit);
            var result = ssoSessionAudit == null ? Enumerable.Empty<UIAMData>() : Map(ssoSessionAudit);
            _auditLogService.LogRead(ServiceCategory.AccountHistory, "GetUIAMData", new { relyingPartyIDs, accessLogLimit }, result);
            return result;
        }
        private async Task<PrivacyLogViewModel> GetSsoSessionAudit(string[] relyingPartyIDs, int accessLogLimit = 5)
        {
            var clientAudit = await _clientAuditFactory.GetCurrent();
            var parameters = new UiamClientApplicationSessionTokenInquireArgs()
            {
                ClientAuditGuid = clientAudit.ClientAuditGuid,
                AcknowledgeToken = null,
                ApplicationSessionToken = _tokenCookie.Token,
                IsFrench = _currentRequest.IsFrenchRequest(_currentRequest.HttpContextAccessor.HttpContext)
            };

            var tokenInquireResult = await _dataApi.UiamApplicationSessionTokenInquire(parameters);
            if (tokenInquireResult == null || tokenInquireResult.ResultCode != 0)
            {
                var resultCode = tokenInquireResult?.ResultCode ?? -1;
                throw new InvalidOperationException($"Failed to obtain valid application session token, result code {resultCode}.");
            }
            var appSession = new UiamApplicationSession()
            {
                ClientAudit = await _clientAuditFactory.GetCurrent(),
                ApplicationSessionToken = tokenInquireResult?.ApplicationSessionToken,
            };
            if (appSession.ApplicationSessionToken == null)
            {
                throw new InvalidOperationException("Application session token is null.");
            }
            var accessToken = await _dataApi.GetAccessToken(
                entityId: _uiamJwtSettings.Issuer,
                audience: _uiamJwtSettings.Audience,
                scopes: [],
                clientAuditId: appSession.ClientAudit.ClientAuditId,
                clientAuditGuid: appSession.ClientAudit.ClientAuditGuid,
                appSessionTokenEncoded: appSession.ApplicationSessionToken?.TokenUrlEncoded ?? "");
            var logs = await _dataApi.GetAccessLogs(accessToken, relyingPartyIDs.OfType<string>().ToList(), accessLogLimit);
            return logs;
        }
        private IEnumerable<UIAMData> Map(PrivacyLogViewModel ssoSessionAudit, int accessLogLimit = 5)
        {
            var result = ssoSessionAudit.RelyingParties.Where(rp => rp.AccessLogs.Count() > 0).Select(rp => new UIAMData()
            {
                RpId = rp.Id,
                AccessedDates = rp.AccessLogs.Select(_ => _.LoginTime.DateTime).Take(accessLogLimit).ToArray(),
                ClaimAttributes = rp.AccessLogs
                    .Select(_ => ssoSessionAudit.ClaimAttributes.FirstOrDefault(ca => ca.Id == _.ClaimAttributeId)?.Attributes ?? "")
                    .SelectMany(s => s.Split(','))?.Distinct()
                    .Select(claimAttribute => ClaimTypeMap.Claims.ContainsKey(claimAttribute) ? ClaimTypeMap.Claims[claimAttribute] : claimAttribute)
            });
            return result;
        }
    }
}
