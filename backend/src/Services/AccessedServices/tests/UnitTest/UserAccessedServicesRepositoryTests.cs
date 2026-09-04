using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.Data;
using GoA.UiamRpClientLib.Authentication;
using GoA.UiamRpClientLib.Context;
using GoA.UiamRpClientLib.DataAccess;
using GoA.UiamRpClientLib.Identity;
using Google.Protobuf.WellKnownTypes;
using Libs.Audit;
using Libs.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using UiamSampleClientWebapi.Models;

namespace UnitTest
{
    public class UserAccessedServicesRepositoryTests
    {
        private readonly Mock<IEServicesDataApi> _mockApi;
        private readonly Mock<ILogger<UserAccessedServicesRepository>> _mockLogger;
        private readonly Mock<IUiamDataApi> _mockDataApi;
        private readonly Mock<ITokenCookie> _mockTokenCookie;
        private readonly Mock<IClientAuditFactory> _mockClientAuditFactory;
        private readonly Mock<ICurrentRequest> _mockCurrentRequest;
        private readonly Mock<IAuditLogService> _mockAuditLogService;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;

        private readonly UserAccessedServicesRepository _repository;

        public UserAccessedServicesRepositoryTests()
        {
            _mockApi = new Mock<IEServicesDataApi>();
            _mockLogger = new Mock<ILogger<UserAccessedServicesRepository>>();
            _mockDataApi = new Mock<IUiamDataApi>();
            _mockTokenCookie = new Mock<ITokenCookie>();
            _mockClientAuditFactory = new Mock<IClientAuditFactory>();
            _mockCurrentRequest = new Mock<ICurrentRequest>();
            _mockAuditLogService = new Mock<IAuditLogService>();
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();

            var expectedSettings = new UIAMJwtSettings
            {
                Audience = "test-audience",
                Issuer = "test-issuer",
                Name = "test-name"
            };

            Dictionary<string, string?>? inMemorySettings = new Dictionary<string, string?>
            {
                { "AccessedServicesOptions:EServiceOptions:Username", "test" },
                { "AccessedServicesOptions:EServiceOptions:Password", "test" },
                { "UiamSettings:DataApiServerUrl", "http://www.test.com/"},
                { "UIAMJwtSettings:Name", expectedSettings.Name },
                { "UIAMJwtSettings:Audience", expectedSettings.Audience },
                { "UIAMJwtSettings:Issuer", expectedSettings.Issuer }
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object)
            {
                BaseAddress = new Uri("https://test.com")
            };

            _repository = new UserAccessedServicesRepository(
                _mockApi.Object,
                configuration,
                _mockLogger.Object,
                _mockDataApi.Object,
                _mockTokenCookie.Object,
                _mockClientAuditFactory.Object,
                _mockCurrentRequest.Object,
                _mockAuditLogService.Object,
                httpClient
            );
        }

        [Fact]
        public async Task GetUserAccessedEServicesAsync_ShouldReturnEServices()
        {
            // Arrange
            var userId = "user1";
            var requestId = "req1";
            var accessLogLimit = 5;

            var mockResponse = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create(JsonSerializer.Serialize(new GetUserHistoryApiResponse()
                {
                    IsUserValid = true,
                    UserId = userId,
                    Products = new List<Product> {
                        new Product {
                            AccessLogs="2024-10-10,2024-09-08",
                            Name="test",
                            Sku="test"
                        }
                    },
                    RequestDateTime = DateTime.Now,
                    RequestId = requestId,
                    ResponseDateTime = DateTime.Now
                }))
            };

            _mockApi.Setup(api => api.GetUserHistory(It.IsAny<GetUserHistoryRequest>(), It.IsAny<Dictionary<string, string>>()))
                    .ReturnsAsync(mockResponse);

            var mockTokenResponse = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = JsonContent.Create("test")
            };
            _mockApi.Setup(api => api.GetAuthorizationToken(It.IsAny<GetTokenRequest>())).ReturnsAsync(mockTokenResponse);

            // Act
            var result = await _repository.GetUserAccessedEServicesAsync(userId, requestId, accessLogLimit);

            // Assert
            Assert.NotNull(result);
            _mockApi.Verify(service => service.GetUserHistory(It.IsAny<GetUserHistoryRequest>(), It.IsAny<Dictionary<string, string>>()), Times.Once);
        }
        
        /* commented out this quest as the uiam client library has been changed dramatically, will need to rewrite the test
        [Fact]
        public async Task GetUserAccessedUIAMDataAsync_ShouldReturnUIAMData()
        {
            // Arrange
            var relyingPartyIds = new[] { "rp1", "rp2" };
            var accessLogLimit = 5;

            var mockClientAudit = new Mock<ClientAudit>();
            mockClientAudit.SetupGet(x => x.ClientAuditGuid).Returns(Guid.Empty);
            _mockClientAuditFactory.Setup(api => api.GetCurrent()).ReturnsAsync(mockClientAudit.Object);
            _mockDataApi.Setup(api => api.GetAccessToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string[]>(), It.IsAny<int>(), It.IsAny<Guid>(), It.IsAny<string>())).ReturnsAsync("test-token");            

            var ssoSessionAudit = new PrivacyLogViewModel
            {
                ClaimAttributes = new List<ClaimAttributeViewModel> { new ClaimAttributeViewModel { Id = 1, Attributes = "attribute1,attribute2" } },
                RelyingParties = new List<RelyingPartyViewModel>{
                        new RelyingPartyViewModel
                        {
                            Id = "rp1",
                            AccessLogs = new List<AccessLogViewModel>{ new AccessLogViewModel { LoginTime = DateTime.UtcNow, ClaimAttributeId = 1 } }
                        }
                }
            };
            _mockDataApi.Setup(api => api.GetAccessLogs(It.IsAny<string>(), It.IsAny<IList<string>>(), It.IsAny<int>())).ReturnsAsync(ssoSessionAudit);

            // Act
            var result = await _repository.GetUserAccessedUIAMDataAsync(relyingPartyIds, accessLogLimit);

            // Assert
            Assert.NotEmpty(result);
            Assert.Equal("rp1", result.First().RpId);
        }*/
    }
}
