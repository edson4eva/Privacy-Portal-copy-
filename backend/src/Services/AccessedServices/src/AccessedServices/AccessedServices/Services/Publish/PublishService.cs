using AccessedServices.AccessedServices.Models;
using AccessedServices.Data;
using AccessedServices.Data.Publish;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal class PublishService(IServiceProvider serviceProvider,
        IDraftServiceRepository draftServiceRepo, IAdminAuditLogService adminAuditLogService, ILogger<PublishService> logger) : IPublishService
    {
        private async Task RevertServicesTable(string env, IPublishEnvironment environment, IEnumerable<Service> services)
        {
            try
            {
                logger.LogInformation($"Reverting changes to services table on {env}...");
                await environment.UpdateServicesTable(services);
            }
            catch (Exception ex)
            {
                logger.LogError(message: ex.Message);
            }
        }
        public async Task ConfirmChanges(string env)
        {
            var environment = serviceProvider.GetRequiredKeyedService<IPublishEnvironment>(env);
            var existingServices = await environment.GetAllServices();
            await environment.CopyPreviewToServiceTable();
            try
            {
                await environment.FlushCache();
            }
            catch (Exception ex)
            {
                logger.LogError(message: ex.Message);
                await RevertServicesTable(env, environment, existingServices);
                throw;
            }
        }
        public async Task Publish(string env)
        {
            var environment = serviceProvider.GetRequiredKeyedService<IPublishEnvironment>(env);
            var drafts = await draftServiceRepo.GetAllAsync();
            var services = drafts.Select(x =>
            {
                var service = x.Adapt<Service>();
                if (env == PublishEnvironment.UAT)
                {
                    service.RPId = x.RPIdForUAT;
                }
                return service;
            }).ToList();
            await environment.UpdatePreviewTable(services);
        }
        public async Task Rollback(string env)
        {
            var environment = serviceProvider.GetRequiredKeyedService<IPublishEnvironment>(env);
            await environment.CopyServicesToPreviewTable();
            if (env == PublishEnvironment.PROD || env == PublishEnvironment.UAT)
            {
                var lowerEnv = (env == PublishEnvironment.PROD) ? PublishEnvironment.UAT : PublishEnvironment.DEV;
                var previousEnvironment = serviceProvider.GetRequiredKeyedService<IPublishEnvironment>(lowerEnv);
                var services = await environment.GetAllServices();
                var previousEnvServices = await previousEnvironment.GetAllServices();
                await previousEnvironment.UpdateServicesTable(services);
                try
                {
                    await previousEnvironment.FlushCache();
                }
                catch (Exception ex)
                {
                    logger.LogError(message: ex.Message);
                    await RevertServicesTable(lowerEnv, previousEnvironment, previousEnvServices);
                }
            }            
        }
    }
}
