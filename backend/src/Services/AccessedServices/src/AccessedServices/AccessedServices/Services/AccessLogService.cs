using AccessedServices.AccessedServices.Models;
using AccessedServices.Data;
using AccessedServices.Extensions;
using AccessedServices.Shared.AppSettingOptions;
using Libs.Dapr;
using Libs.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Globalization;
using System.Text.RegularExpressions;

namespace AccessedServices.AccessedServices.Services
{
    internal enum DataFreshness
    {
        None,
        Fresh,
        Cache,
        Stale
    }
    public class AccessLogService : IAccessLogService
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IUserAccessedServicesRepository _userAccessedServicesRepository;
        private readonly IDaprClient _daprClient;
        private readonly IHashingService _hashingService;
        private readonly ILogger<AccessLogService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly StateStoreOptions _stateStoreOptions;

        public AccessLogService(
            IServiceRepository serviceRepository,
            IUserAccessedServicesRepository userAccessedServicesRepository,
            IDaprClient daprClient,
            IOptions<StateStoreOptions> options,
            IHashingService hashingService,
            ILogger<AccessLogService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _serviceRepository = serviceRepository;
            _userAccessedServicesRepository = userAccessedServicesRepository;
            _daprClient = daprClient;
            _hashingService = hashingService;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _stateStoreOptions = options.Value;
        }
        public async Task<AccessedServicesResult> GetUserAccessedServicesAsync(string userId)
        {
            var isPreview = _httpContextAccessor.HttpContext.IsPreviewMode();
            var now = DateTime.UtcNow;

            AccessedServicesCacheResult? cachedUIAM = null;
            AccessedServicesCacheResult? cachedEServices = null;

            bool isUIAMCacheFresh = false;
            bool isEServicesCacheFresh = false;

            if (!isPreview)
            {
                var cacheTasks = new[]
                {
                    TryGetCacheAsync(userId, Origin.UIAM),
                    TryGetCacheAsync(userId, Origin.EServices)
                };

                await Task.WhenAll(cacheTasks);

                cachedUIAM = cacheTasks[0].Result;
                cachedEServices = cacheTasks[1].Result;

                isUIAMCacheFresh = IsCacheFresh(cachedUIAM, now, _stateStoreOptions.UIAMCacheStaleAfterSeconds);
                isEServicesCacheFresh = IsCacheFresh(cachedEServices, now, _stateStoreOptions.EServicesCacheStaleAfterSeconds);

                if (isUIAMCacheFresh && isEServicesCacheFresh &&
                    cachedUIAM?.AccessedServices != null && cachedEServices?.AccessedServices != null)
                {
                    var combined = GetCombinedAndSortedAccessedServices(
                        cachedUIAM.AccessedServices,
                        cachedEServices.AccessedServices
                    );

                    return new AccessedServicesResult
                    {
                        IsUIAMStale = false,
                        IsEServiceStale = false,
                        AccessedServices = combined
                    };
                }
            }

            var services = await _serviceRepository.GetAllAsync();
            if (services == null || !services.Any())
            {
                _logger.LogError("No services enabled to show on UI");
                return new AccessedServicesResult
                {
                    IsUIAMStale = false,
                    IsEServiceStale = false,
                    AccessedServices = Enumerable.Empty<AccessedService>()
                };
            }

            var (uiamServices, uiamFreshness) = await GetServicesAsync(
                userId,
                Origin.UIAM,
                cachedUIAM,
                isUIAMCacheFresh,
                () => GetAccessedUIAMDataAsync(services),
                data => SaveUIAMDataWithTTLAsync(userId, data)
            );

            var (eServices, eServicesFreshness) = await GetServicesAsync(
                userId,
                Origin.EServices,
                cachedEServices,
                isEServicesCacheFresh,
                () => GetAccessedEServicesAsync(userId, services),
                data => SaveEServicesWithTTLAsync(userId, data)
            );

            var allAccessedServices = GetCombinedAndSortedAccessedServices(eServices, uiamServices);

            return new AccessedServicesResult
            {
                IsUIAMStale = uiamFreshness == DataFreshness.Stale,
                IsEServiceStale = eServicesFreshness == DataFreshness.Stale,
                AccessedServices = allAccessedServices
            };
        }

        private bool IsCacheFresh(AccessedServicesCacheResult? cache, DateTime now, int staleAfterSeconds)
        {
            return cache?.AccessedServices != null &&
                   (now - cache.CachedTimeUTC).TotalSeconds < staleAfterSeconds;
        }

        private async Task<(IEnumerable<AccessedService>, DataFreshness)> GetServicesAsync(
            string userId,
            string origin,
            AccessedServicesCacheResult? cachedData,
            bool isCacheFresh,
            Func<Task<IEnumerable<AccessedService>>> fetchFreshData,
            Func<IEnumerable<AccessedService>, Task> saveFreshData)
        {
            IEnumerable<AccessedService> services = Enumerable.Empty<AccessedService>();
            DataFreshness freshness = DataFreshness.None;

            if (isCacheFresh && cachedData?.AccessedServices != null)
            {
                return (cachedData.AccessedServices, DataFreshness.Cache);
            }

            try
            {
                services = await fetchFreshData();
                freshness = DataFreshness.Fresh;

                if (services.Any())
                    _ = saveFreshData(services);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching {Source} services for {UserId}", origin, userId);

                if (cachedData?.AccessedServices != null)
                {
                    _logger.LogWarning("Using stale {Source} services for {UserId}", origin, userId);
                    services = cachedData.AccessedServices;
                    freshness = DataFreshness.Stale;
                }
                else
                {
                    _logger.LogInformation("No fallback cache available for {Source} services for {UserId}", origin, userId);
                }
            }

            return (services, freshness);
        }


        private IOrderedEnumerable<AccessedService> GetCombinedAndSortedAccessedServices(IEnumerable<AccessedService> eServices, IEnumerable<AccessedService> uiamData)
        {
            IEnumerable<AccessedService> accessedServices = eServices.Concat(uiamData);
            IOrderedEnumerable<AccessedService> accessedServicesSorted = accessedServices.OrderByDescending(_ => _.AccessedDates.Max());
            return accessedServicesSorted;
        }

        private async Task<IEnumerable<AccessedService>> GetAccessedUIAMDataAsync(IEnumerable<Service> services)
        {
            var uiamServices = services.Where(_ => _.Origin == Origin.UIAM && !string.IsNullOrWhiteSpace(_.RPId) && _.ShowOnUI).ToList();
            if (uiamServices == null || uiamServices.Count() == 0)
            {
                _logger.LogWarning("No UIAM Services enabled to show on UI");
                return Enumerable.Empty<AccessedService>();
            }
            var relyingPartyIds = uiamServices.Select(_ => _.RPId!).ToArray()!;
            var accessedUIAMServices = await _userAccessedServicesRepository.GetUserAccessedUIAMDataAsync(relyingPartyIds);
            if (accessedUIAMServices == null || !accessedUIAMServices.Any())
            {
                _logger.LogInformation("No UIAM Services found");
                return Enumerable.Empty<AccessedService>();
            }

            var allowedToShowUIAMServices = accessedUIAMServices
                .Where(uiam => uiamServices.Select(service => service.RPId).Contains(uiam.RpId)
                    && uiamServices.FirstOrDefault(service => service.Id == ServiceId.EServices)?.RPId != uiam.RpId);
            if (allowedToShowUIAMServices == null || allowedToShowUIAMServices.Count() == 0)
            {
                _logger.LogInformation("No allowed UIAM Services found");
                return Enumerable.Empty<AccessedService>();
            }
            var accessedServices = allowedToShowUIAMServices.Select(uiam =>
            {
                var service = uiamServices.First(service => service.RPId == uiam.RpId);
                return new AccessedService()
                {
                    Id = service.Id,
                    Name = service.ServiceName,
                    IsAvailable = service.IsAvailable,
                    AccessedDates = uiam.AccessedDates.OrderDescending().ToArray(),
                    ClaimAttributes = uiam.ClaimAttributes,
                    Category = service.CategoryId
                };
            }).ToList();
            return accessedServices;
        }

        private async Task<IEnumerable<AccessedService>> GetAccessedEServicesAsync(string userId, IEnumerable<Service> services)
        {
            var eServices = services.Where(_ => _.Origin == Origin.EServices && _.ShowOnUI == true && !string.IsNullOrWhiteSpace(_.Sku)).ToList();
            if (!eServices.Any())
            {
                _logger.LogInformation("No eServices found in DB");
                return Enumerable.Empty<AccessedService>();
            }

            var accessedEServices = await _userAccessedServicesRepository.GetUserAccessedEServicesAsync(userId, Guid.NewGuid().ToString());
            if (accessedEServices == null || accessedEServices.Products.Count() == 0)
            {
                _logger.LogInformation("No eServices found for {UserId}", userId);
                return Enumerable.Empty<AccessedService>();
            }

            var eServiceSkus = eServices.Select(service => service.Sku!);

            var allowedToShowEServices = accessedEServices.Products
                                            .Where(product => eServiceSkus.Contains(product.Sku) || MatchesAnySkuRegex(product.Sku, eServiceSkus));
            if (allowedToShowEServices == null || allowedToShowEServices.Count() == 0)
            {
                _logger.LogInformation("No allowed eServices found for {UserId}", userId);
                return Enumerable.Empty<AccessedService>();
            }
            var accessedServices = allowedToShowEServices.Select(product =>
            {
                var service = eServices.First(service => service.Sku == product.Sku || MatchesSkuRegex(product.Sku, service.Sku!));
                return new AccessedService()
                {
                    Id = service.Id,
                    Name = service.ServiceName,
                    IsAvailable = service.IsAvailable,
                    AccessedDates = ConvertStringToDates(product.AccessLogs).OrderDescending().ToArray(),
                    Category = service.CategoryId
                };
            }).ToList();
            return accessedServices;
        }

        private bool MatchesSkuRegex(string input, string regexPattern)
        {
            try
            {
                var regex = new Regex(regexPattern);
                if (regex.IsMatch(input)) return true;
            }
            catch (ArgumentException)
            {
                _logger.LogError($"Invalid SKU regex pattern: {regexPattern}");
            }
            return false;
        }

        private bool MatchesAnySkuRegex(string input, IEnumerable<string> regexPatterns)
        {
            foreach (var pattern in regexPatterns)
            {
                if (MatchesSkuRegex(input, pattern)) return true;
            }
            return false;
        }

        private DateTime[] ConvertStringToDates(string datesString)
        {
            var dateStrings = datesString.Split(',');
            List<DateTime> dateList = new List<DateTime>();
            foreach (var dateStr in dateStrings)
            {
                if (DateTime.TryParse(dateStr.Trim(), CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out DateTime parsedDate))
                {
                    dateList.Add(parsedDate);
                }
                else
                {
                    Console.WriteLine($"Invalid date format: {dateStr}");
                }
            }
            return dateList.OrderDescending().ToArray();
        }

        private async Task<AccessedServicesCacheResult?> TryGetCacheAsync(string userId, string serviceOrigin)
        {
            var key = GetCacheKey(userId, serviceOrigin);
            try
            {
                var state = await _daprClient.GetStateEntryAsync<AccessedServicesCacheResult>(_stateStoreOptions.StoreName, key);
                return state.Value != null ? state.Value : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving accessed services of {serviceOrigin} from the cache for userId {UserId}. Proceeding with fallback.", serviceOrigin, userId);
                return null;
            }
        }

        private string GetCacheKey(string userId, string serviceOrigin)
        {
            var userIdHash = _hashingService.Hash(userId);
            if (serviceOrigin == Origin.EServices)
                return $"cache:e:accessed-services:{userIdHash}";
            else if (serviceOrigin == Origin.UIAM)
                return $"cache:u:accessed-services:{userIdHash}";
            else throw new ArgumentException("Invalid serviceOrigin");
        }

        private async Task SaveEServicesWithTTLAsync(string userId, IEnumerable<AccessedService> accessedServices)
        {
            var key = GetCacheKey(userId, Origin.EServices);
            try
            {
                var metadata = new Dictionary<string, string>
                {
                    { "ttlInSeconds", _stateStoreOptions.EServicesCacheTTLInSeconds.ToString() }
                };

                var value = new AccessedServicesCacheResult() { CachedTimeUTC = DateTime.UtcNow, AccessedServices = accessedServices };

                await _daprClient.SaveStateAsync(_stateStoreOptions.StoreName, key, value, metadata: metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving EServices to the cache for userId {UserId}.", userId);
            }
        }

        private async Task SaveUIAMDataWithTTLAsync(string userId, IEnumerable<AccessedService> accessedServices)
        {
            var key = GetCacheKey(userId, Origin.UIAM);
            try
            {
                var metadata = new Dictionary<string, string>
                {
                    { "ttlInSeconds", _stateStoreOptions.UIAMCacheTTLInSeconds.ToString() }
                };

                var value = new AccessedServicesCacheResult() { CachedTimeUTC = DateTime.UtcNow, AccessedServices = accessedServices };

                await _daprClient.SaveStateAsync(_stateStoreOptions.StoreName, key, value, metadata: metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving UIAMData to the cache for userId {UserId}.", userId);
            }
        }
    }
}
