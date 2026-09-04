using Azure.Storage.Blobs;
using Azure.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Libs.Auth;

namespace Complaints.Extensions.Infrastructure
{
    public static class StorageExtensions
    {
        public static IServiceCollection AddBlobServiceClient(this IServiceCollection services, IConfiguration _configuration)
        {
            services.AddSingleton(serviceProvider =>
            {

                var blobStorageConfig = _configuration.GetSection("AzureBlobStorage").Get<AzureBlobStorage>();

                if (blobStorageConfig == null || string.IsNullOrWhiteSpace(blobStorageConfig.StorageAccountName) || string.IsNullOrWhiteSpace(blobStorageConfig.StorageAccountKey))
                {
                    throw new InvalidOperationException("Azure Blob Storage Account name or key is not provided in the configuration.");
                }

                var sharedKeyCredential = new StorageSharedKeyCredential(blobStorageConfig.StorageAccountName, blobStorageConfig.StorageAccountKey);

                var blobServiceClient = new BlobServiceClient(new Uri($"https://{blobStorageConfig.StorageAccountName}.blob.core.windows.net"), sharedKeyCredential);

                return blobServiceClient;
            });

            return services;
        }
    }
}
