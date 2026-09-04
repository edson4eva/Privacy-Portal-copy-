using AccessedServices.AccessedServices.Features.EServicesDataApi.V1;
using AccessedServices.AccessedServices.Features.GettingAccessedServices.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using AccessedServices.Shared.AppSettingOptions;
using Dapr;
using Dapr.Client;
using Libs.Dapr;
using Libs.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace UnitTest
{
    public class AccessLogServiceTests
    {
        private readonly AccessLogService _service;
        private readonly Mock<IServiceRepository> _mockServiceRepository;
        private readonly Mock<IUserAccessedServicesRepository> _mockUserAccessedServicesRepository;
        private readonly Mock<IDaprClient> _mockDaprClient;
        private readonly Mock<IHashingService> _mockHashingService;
        private readonly Mock<ILogger<AccessLogService>> _mockLogger;
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly string _storeName = "TestDaprStore";
        private readonly int _ttlInSeconds = 120;
        private readonly int _staleAfterSeconds = 60;
        public AccessLogServiceTests()
        {
            _mockServiceRepository = new Mock<IServiceRepository>();
            _mockUserAccessedServicesRepository = new Mock<IUserAccessedServicesRepository>();
            _mockDaprClient = new Mock<IDaprClient>();
            var stateStoreOptions = new StateStoreOptions
            {
                StoreName = _storeName,
                EServicesCacheTTLInSeconds = _ttlInSeconds,
                EServicesCacheStaleAfterSeconds = _staleAfterSeconds,
                UIAMCacheTTLInSeconds = _ttlInSeconds,
                UIAMCacheStaleAfterSeconds = _staleAfterSeconds
            };
            var mockOptions = new Mock<IOptions<StateStoreOptions>>();
            mockOptions.Setup(o => o.Value).Returns(stateStoreOptions);
            _mockHashingService = new Mock<IHashingService>();
            _mockLogger = new Mock<ILogger<AccessLogService>>();
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

            _service = new AccessLogService(_mockServiceRepository.Object
                , _mockUserAccessedServicesRepository.Object
                , _mockDaprClient.Object
                , mockOptions.Object
                , _mockHashingService.Object
                , _mockLogger.Object
                , _mockHttpContextAccessor.Object);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldReturnFromCache_WhenDataIsFresh()
        {
            // Arrange
            string userId = "user1";
            string hashedUserId = "HashedUserId";
            var daprClient = new Mock<DaprClient>();
            _mockHashingService.Setup(_ => _.Hash(It.IsAny<string>())).Returns(hashedUserId);

            AccessedServicesCacheResult cachedUIAMResult = new AccessedServicesCacheResult()
            {
                CachedTimeUTC = DateTime.UtcNow,
                AccessedServices = new List<AccessedService>
                {
                    new AccessedService { Id = "uiam-service", Name = "UIAM Service", IsAvailable = true, AccessedDates=[DateTime.Now], Category="category1" }
                }
            };
            var uiamCacheKey = $"cache:u:accessed-services:{hashedUserId}";
            _mockDaprClient.Setup(d => d.GetStateEntryAsync<AccessedServicesCacheResult>(_storeName, uiamCacheKey))
                           .ReturnsAsync(new StateEntry<AccessedServicesCacheResult>(daprClient.Object, "TestDaprStore", uiamCacheKey, cachedUIAMResult, ""));
            AccessedServicesCacheResult cachedEServiceResult = new AccessedServicesCacheResult()
            {
                CachedTimeUTC = DateTime.UtcNow,
                AccessedServices = new List<AccessedService>
                {
                    new AccessedService { Id = "eservice-service", Name = "EService Service", IsAvailable = true, AccessedDates=[DateTime.Now], Category="category2" }
                }
            };
            var eserviceCacheKey = $"cache:e:accessed-services:{hashedUserId}";
            _mockDaprClient.Setup(d => d.GetStateEntryAsync<AccessedServicesCacheResult>(_storeName, eserviceCacheKey))
                           .ReturnsAsync(new StateEntry<AccessedServicesCacheResult>(daprClient.Object, "TestDaprStore", eserviceCacheKey, cachedEServiceResult, ""));

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.Equal(cachedUIAMResult.AccessedServices.Count() + cachedEServiceResult.AccessedServices.Count(), result.AccessedServices.Count());
            Assert.True(result.AccessedServices?.Any(_ => _.Id == cachedUIAMResult.AccessedServices.First().Id));
            Assert.True(result.AccessedServices?.Any(_ => _.Id == cachedEServiceResult.AccessedServices.First().Id));
            _mockDaprClient.Verify(d => d.GetStateEntryAsync<AccessedServicesCacheResult>(_storeName, uiamCacheKey), Times.Once);
            _mockDaprClient.Verify(d => d.GetStateEntryAsync<AccessedServicesCacheResult>(_storeName, eserviceCacheKey), Times.Once);
            _mockServiceRepository.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldReturnCombinedAndSortedListOfUIAMAndEServices()
        {
            // Arrange
            var userId = "test-user";

            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.EServices, Sku = "Sku1", ShowOnUI = true, ServiceName = "eService 1", Id = "ServiceId2", CategoryId = "badge text 2" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            var accessedUIAMServices = new List<UIAMData>
            {
                new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01") } }
            };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
                {
                    new Product { Sku = "Sku1", AccessLogs = "2025-01-02" }
                }
            };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.Equal(2, result.AccessedServices.Count());
            Assert.Equal("eService 1", result.AccessedServices.First().Name);
            Assert.Equal("UIAM Service 1", result.AccessedServices.Last().Name);

            Assert.True(result.AccessedServices.First().AccessedDates.Max() > result.AccessedServices.Last().AccessedDates.Max());
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldReturnAccessedServicesWithSortedAccessedDates()
        {
            // Arrange
            var userId = "test-user";
            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.EServices, Sku = "Sku1", ShowOnUI = true, ServiceName = "eService 1", Id = "ServiceId2", CategoryId = "badge text 2" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            var accessedUIAMServices = new List<UIAMData>
            {
                new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01"), DateTime.Parse("2025-01-03") } }
            };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
                {
                    new Product { Sku = "Sku1", AccessLogs = $"{DateTime.Parse("2025-01-02").ToString()}, {DateTime.Parse("2025-01-04").ToString()}"}
                }
            };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.NotEmpty(result.AccessedServices);

            foreach (var accessedService in result.AccessedServices)
            {
                var dates = accessedService.AccessedDates;
                for (int i = 0; i < dates.Length - 1; i++)
                {
                    Assert.True(dates[i] >= dates[i + 1], "AccessedDates are not sorted in descending order.");
                }
            }
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldSaveEServicesCacheWithCorrectTTL_WhenDataIsFresh()
        {
            // Arrange
            var userId = "test-user";
            string hashedUserId = "HashedUserId";
            var eserviceCacheKey = $"cache:e:accessed-services:{hashedUserId}";
            var expectedTTL = _ttlInSeconds.ToString();

            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.EServices, Sku = "Sku1", ShowOnUI = true, ServiceName = "eService 1", Id = "ServiceId2", CategoryId = "badge text 2" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            var accessedUIAMServices = new List<UIAMData>
            {
                new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01") } }
            };
            _mockUserAccessedServicesRepository.Setup(repo =>
                repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
                {
                    new Product { Sku = "Sku1", AccessLogs = "2025-01-02" }
                }
            };
            _mockUserAccessedServicesRepository.Setup(repo =>
                repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            _mockHashingService.Setup(_ => _.Hash(It.IsAny<string>())).Returns(hashedUserId);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            _mockUserAccessedServicesRepository.Verify(_ => _.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Once);
            _mockDaprClient.Verify(client =>
                client.SaveStateAsync(
                    _storeName,
                    eserviceCacheKey,
                    It.Is<AccessedServicesCacheResult>(entry =>
                        entry.AccessedServices.Any(s => s.Name == "eService 1") &&
                        entry.CachedTimeUTC <= DateTime.UtcNow
                    ),
                    It.Is<Dictionary<string, string>>(metadata =>
                        metadata.ContainsKey("ttlInSeconds") && metadata["ttlInSeconds"] == expectedTTL
                    )),
                Times.Once);

            Assert.NotEmpty(result.AccessedServices);
            Assert.Equal("eService 1", result.AccessedServices.First().Name);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldSaveUIAMCacheWithCorrectTTL_WhenDataIsFresh()
        {
            // Arrange
            var userId = "test-user";
            string hashedUserId = "HashedUserId";
            var uiamCacheKey = $"cache:u:accessed-services:{hashedUserId}";
            var expectedTTL = _ttlInSeconds.ToString();

            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.EServices, Sku = "Sku1", ShowOnUI = true, ServiceName = "eService 1", Id = "ServiceId2", CategoryId = "badge text 2" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            var accessedUIAMServices = new List<UIAMData>
            {
                new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01") } }
            };
            _mockUserAccessedServicesRepository.Setup(repo =>
                repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
                {
                    new Product { Sku = "Sku1", AccessLogs = "2025-01-02" }
                }
            };
            _mockUserAccessedServicesRepository.Setup(repo =>
                repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            _mockHashingService.Setup(_ => _.Hash(It.IsAny<string>())).Returns(hashedUserId);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            _mockUserAccessedServicesRepository.Verify(_ => _.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()), Times.Once);
            _mockDaprClient.Verify(client =>
                client.SaveStateAsync(
                    _storeName,
                    uiamCacheKey,
                    It.Is<AccessedServicesCacheResult>(entry =>
                        entry.AccessedServices.Any(s => s.Name == "UIAM Service 1") &&
                        entry.CachedTimeUTC <= DateTime.UtcNow
                    ),
                    It.Is<Dictionary<string, string>>(metadata =>
                        metadata.ContainsKey("ttlInSeconds") &&
                        metadata["ttlInSeconds"] == expectedTTL
                    )),
                Times.Once);

            Assert.NotEmpty(result.AccessedServices);
            Assert.Contains(result.AccessedServices, s => s.Name == "UIAM Service 1");
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldSuppressErrorAndFallsBack_WhenCacheFails()
        {
            // Arrange
            string userId = "user1";
            string hashedUserId = "HashedUserId";
            _mockHashingService.Setup(h => h.Hash(userId)).Returns(hashedUserId);
            _mockDaprClient.Setup(d => d.GetStateEntryAsync<IEnumerable<AccessedService>>(_storeName, hashedUserId))
                           .ThrowsAsync(new Exception("Cache retrieval failed"));
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(Enumerable.Empty<Service>());

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            _mockServiceRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldFetchesFromRepository_WhenNoCacheData()
        {
            // Arrange
            string userId = "user2";
            string hashedUserId = "HashedUserId";

            _mockHashingService.Setup(_ => _.Hash(It.IsAny<string>())).Returns(hashedUserId);
            var daprClient = new Mock<DaprClient>();
            _mockDaprClient.Setup(d => d.GetStateEntryAsync<IEnumerable<AccessedService>?>(_storeName, hashedUserId))
                           .ReturnsAsync(new StateEntry<IEnumerable<AccessedService>?>(daprClient.Object, _storeName, hashedUserId, null, ""));

            var services = new List<Service>
            {
                new Service { Id = "service1", ServiceName = "Service 1", ShowOnUI = true, Origin = Origin.UIAM, CategoryId="badge text1", RPId="test-rp-id"  },
                new Service { Id = "service2", ServiceName = "Service 2", ShowOnUI = true, Origin = Origin.EServices, CategoryId="badge text2", Sku="test-sku"  }
            };
            _mockServiceRepository.Setup(s => s.GetAllAsync()).ReturnsAsync(services);
            _mockUserAccessedServicesRepository.Setup(_ => _.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(Enumerable.Empty<UIAMData>());
            _mockUserAccessedServicesRepository
                .Setup(u => u.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync((GetUserHistoryApiResponse?)null);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            _mockServiceRepository.Verify(s => s.GetAllAsync(), Times.Once);
            _mockUserAccessedServicesRepository.Verify(u => u.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()), Times.Once);
            _mockUserAccessedServicesRepository.Verify(u => u.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()), Times.Once);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldNotCallGetAccessedUIAMDataAsync_WhenNoUIAMServicesFoundInDB()
        {
            // Arrange
            var services = new List<Service>
            {
                new Service { Origin = Origin.EServices, RPId = "RP1", ShowOnUI = true, CategoryId="badge text 1", Id="service1", ServiceName="Service 1" },
                new Service { Origin = Origin.EServices, RPId = "RP2", ShowOnUI = true, CategoryId="badge text 2", Id="service2", ServiceName="Service 2" }
            };

            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            // Act
            var result = await _service.GetUserAccessedServicesAsync("test-user");

            // Assert
            _mockUserAccessedServicesRepository
                .Verify(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldCallGetAccessedUIAMDataAsync_WhenUIAMServicesFoundInDB()
        {
            // Arrange
            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, CategoryId="badge text 1", Id="service1", ServiceName="Service 1" },
                new Service { Origin = Origin.EServices, RPId = "RP2", ShowOnUI = true, CategoryId="badge text 2", Id="service2", ServiceName="Service 2" }
            };

            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            // Act
            var result = await _service.GetUserAccessedServicesAsync("test-user");

            // Assert
            _mockUserAccessedServicesRepository
                .Verify(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()), Times.Once);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldExcludeUIAMServices_WhenShowOnUIIsFalse()
        {
            // Arrange
            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId="badge text 1" },
                new Service { Origin = Origin.UIAM, RPId = "RP2", ShowOnUI = false, ServiceName = "UIAM Service 2", Id = "ServiceId2", CategoryId="badge text 2" },
                new Service { Origin = Origin.UIAM, RPId = "RP3", ShowOnUI = true, ServiceName = "UIAM Service 3", Id = "ServiceId3", CategoryId="badge text 3" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);
            var accessedUIAMServices = new List<UIAMData>
            {
                new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01") } },
                new UIAMData { RpId = "RP2", AccessedDates = new[] { DateTime.Parse("2025-01-02") } },
                new UIAMData { RpId = "RP3", AccessedDates = new[] { DateTime.Parse("2025-01-03") } }
            };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync("test-user");

            // Assert
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 1");
            Assert.DoesNotContain(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 2");
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 3");

            Assert.Equal(2, result.AccessedServices.Count());
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldExcludeUIAMServices_WhenNotFoundInDB()
        {
            // Arrange
            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId="badge text 1" },
                new Service { Origin = Origin.UIAM, RPId = "RP2", ShowOnUI = true, ServiceName = "UIAM Service 2", Id = "ServiceId2", CategoryId="badge text 2" },
                new Service { Origin = Origin.UIAM, RPId = "RP3", ShowOnUI = true, ServiceName = "UIAM Service 3", Id = "ServiceId3", CategoryId="badge text 3" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);

            var accessedUIAMServices = new List<UIAMData>
                {
                    new UIAMData { RpId = "RP1", AccessedDates = new[] { DateTime.Parse("2025-01-01") } },
                    new UIAMData { RpId = "RP2", AccessedDates = new[] { DateTime.Parse("2025-01-02") } },
                    new UIAMData { RpId = "RP3", AccessedDates = new[] { DateTime.Parse("2025-01-03") } },
                    new UIAMData { RpId = "RP4", AccessedDates = new[] { DateTime.Parse("2025-01-04") } }
                };
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(accessedUIAMServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync("test-user");

            // Assert
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 1");
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 2");
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 3");

            Assert.DoesNotContain(result.AccessedServices, accessedService => accessedService.Name == "UIAM Service 4");

            Assert.Equal(3, result.AccessedServices.Count());
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldReturnEmptyList_WhenNoRecordsFromGetAccessedUIAMDataAsync()
        {
            // Arrange
            var userId = "test-user";
            var services = new List<Service>
            {
                new Service { Origin = Origin.UIAM, RPId = "RP1", ShowOnUI = true, ServiceName = "UIAM Service 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.UIAM, RPId = "RP2", ShowOnUI = true, ServiceName = "UIAM Service 2", Id = "ServiceId2", CategoryId = "badge text 2" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedUIAMDataAsync(It.IsAny<string[]>(), It.IsAny<int>()))
                .ReturnsAsync(new List<UIAMData>());

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.Empty(result.AccessedServices);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldExcludeEServices_WhenShowOnUIIsFalse()
        {
            // Arrange
            var services = new List<Service>
            {
                new Service { Origin = Origin.EServices, RPId = "RP1", Sku = "sku1", ShowOnUI = true, ServiceName = "Service 1",CategoryId="badge text 1", Id="service 1" },
                new Service { Origin = Origin.EServices, RPId = "RP2", Sku = "sku2", ShowOnUI = false, ServiceName = "Service 2",CategoryId="badge text 2", Id="service 2" },
                new Service { Origin = Origin.EServices, RPId = "RP3", Sku = "sku3", ShowOnUI = true, ServiceName = "Service 3",CategoryId="badge text 3", Id="service 3" }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);
            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
            {
                new Product { Sku = "sku1", AccessLogs = "2025-01-01,2025-01-02" },
                new Product { Sku = "sku3", AccessLogs = "2025-01-03,2025-01-04" },
                new Product { Sku = "sku2", AccessLogs = "2025-01-05" }
            }
            };

            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync("test-user");

            // Assert
            Assert.DoesNotContain(result.AccessedServices, accessedService => accessedService.Name == "Service 2");

            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "Service 1");
            Assert.Contains(result.AccessedServices, accessedService => accessedService.Name == "Service 3");

            Assert.Equal(2, result.AccessedServices.Count());
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldExcludeEServices_WhenNotFoundInDB()
        {
            // Arrange
            var userId = "test-user";
            var services = new List<Service>
            {
                new Service { Origin = Origin.EServices, Sku = "sku1", ShowOnUI = true, IsAvailable = true, ServiceName = "Service 1", CategoryId = "badge text 1", Id = "service 1" },
                new Service { Origin = Origin.EServices, Sku = "sku2", ShowOnUI = true, IsAvailable = true, ServiceName = "Service 2", CategoryId = "badge text 2", Id = "service 2" }
            };
            var accessedEServices = new GetUserHistoryApiResponse
            {
                Products = new List<Product>
                {
                    new Product { Sku = "sku1", Name = "Service 1", AccessLogs = "2025-01-01" },
                    new Product { Sku = "sku3", Name = "Service 3", AccessLogs = "2025-01-02" }
                }
            };
            _mockServiceRepository
                .Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(services);

            _mockUserAccessedServicesRepository
                .Setup(repo => repo.GetUserAccessedEServicesAsync(userId, It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(accessedEServices);

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.AccessedServices);

            var service1 = result.AccessedServices.FirstOrDefault(s => s.Name == "Service 1");
            Assert.NotNull(service1);
            Assert.True(service1.IsAvailable);
        }

        [Fact]
        public async Task GetUserAccessedServicesAsync_ShouldReturnEmptyList_WhenNoRecordsFromGetAccessedEServicesAsync()
        {
            // Arrange
            var userId = "test-user";
            var services = new List<Service>
            {
                new Service { Origin = Origin.EServices, Sku = "Sku1", ShowOnUI = true, ServiceName = "eService 1", Id = "ServiceId1", CategoryId = "badge text 1" },
                new Service { Origin = Origin.EServices, Sku = "Sku2", ShowOnUI = true, ServiceName = "eService 2", Id = "ServiceId2", CategoryId = "badge text 1"  }
            };
            _mockServiceRepository.Setup(repo => repo.GetAllAsync()).ReturnsAsync(services);
            _mockUserAccessedServicesRepository.Setup(repo => repo.GetUserAccessedEServicesAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
                .ReturnsAsync(new GetUserHistoryApiResponse { Products = new List<Product>() });

            // Act
            var result = await _service.GetUserAccessedServicesAsync(userId);

            // Assert
            Assert.Empty(result.AccessedServices);
        }
    }
}