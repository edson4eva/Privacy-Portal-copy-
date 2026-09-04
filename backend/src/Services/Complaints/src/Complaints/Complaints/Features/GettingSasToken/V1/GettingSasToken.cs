using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using FluentValidation;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;

namespace Complaints.Complaints.Features.GettingSasToken.V1
{
    public record GetSasToken() : IRequest<GetSasTokenResult>;
    
    public record GetDownloadSasToken(string BlobName) : IRequest<GetSasTokenResult>;

    public record GetSasTokenResult(string Uri);

    public record GetSasTokenResponseDto(string Uri);

    public class GetSasTokenFeature : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/sas-token",
                async (IMediator mediator, CancellationToken cancellationToken) =>
                {
                    var result = await mediator.Send(new GetSasToken(), cancellationToken);

                    var response = result.Adapt<GetSasTokenResponseDto>();

                    return Results.Ok(response);
                })
                //.RequireAuthorization()
                .WithName("GetSasToken")
                .WithApiVersionSet(builder.NewApiVersionSet("SasToken").Build())
                .Produces<GetSasTokenResponseDto>()
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithSummary("Generate SAS Token for a blob container.")
                .WithDescription("Generate a time-limited SAS token for a blob in a specified container")
                .WithOpenApi()
                .HasApiVersion(1.0);

            builder.MapPost($"{EndpointConfig.BaseApiPath}/sas-token/download", 
                async (GetDownloadSasToken request, IMediator mediator, CancellationToken cancellationToken) => 
                { 
                    var result = await mediator.Send(request, cancellationToken); 
                    var response = result.Adapt<GetSasTokenResponseDto>(); 
                    return Results.Ok(response); 
                })
                .WithName("GetDownloadSasToken")
                .WithApiVersionSet(builder.NewApiVersionSet("SasToken").Build())
                .Produces<GetSasTokenResponseDto>()
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithSummary("Generate Download SAS Token for a blob container.")
                .WithDescription("Generate a time-limited SAS token for downloading from a blob in a specified container")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }
 
    public class GetSasTokenValidator : AbstractValidator<GetSasToken>
    {
        public GetSasTokenValidator()
        {
            // No need for validation here since the request done in backend
        }
    }

    internal class GetSasTokenHandler : IRequestHandler<GetSasToken, GetSasTokenResult>
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;

        public GetSasTokenHandler(BlobServiceClient blobServiceClient, IConfiguration configuration)
        {
            _blobServiceClient = blobServiceClient;
            _configuration = configuration;
        }

        public async Task<GetSasTokenResult> Handle(GetSasToken request, CancellationToken cancellationToken)
        {
            var blobStorageConfig = _configuration.GetSection("AzureBlobStorage").Get<AzureBlobStorage>();
            var containerClient = _blobServiceClient.GetBlobContainerClient(blobStorageConfig.ContainerName);
            await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob, cancellationToken: cancellationToken);

            var storageSharedKeyCredential = new StorageSharedKeyCredential(blobStorageConfig.StorageAccountName, blobStorageConfig.StorageAccountKey);

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = blobStorageConfig.ContainerName,
                Resource = "c",
                ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(blobStorageConfig.UploadDurationInMinutes)
            };

            sasBuilder.SetPermissions(BlobContainerSasPermissions.Write);

            BlobUriBuilder blobUriBuilder = new BlobUriBuilder(containerClient.Uri)
            {
                Sas = sasBuilder.ToSasQueryParameters(storageSharedKeyCredential)
            };

            return new GetSasTokenResult(blobUriBuilder.ToUri().ToString());
        }
    }

    internal class GetDownloadSasTokenHandler : IRequestHandler<GetDownloadSasToken, GetSasTokenResult>
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;

        public GetDownloadSasTokenHandler(BlobServiceClient blobServiceClient, IConfiguration configuration)
        {
            _blobServiceClient = blobServiceClient;
            _configuration = configuration;
        }

        public async Task<GetSasTokenResult> Handle(GetDownloadSasToken request, CancellationToken cancellationToken)
        {
            var blobStorageConfig = _configuration.GetSection("AzureBlobStorage").Get<AzureBlobStorage>();
            if (blobStorageConfig == null)
            {
                throw new ArgumentNullException(nameof(blobStorageConfig), "Azure Blob Storage configuration is missing.");
            }

            string containerName = blobStorageConfig.ContainerName;
            string storageAccountName = blobStorageConfig.StorageAccountName;
            string storageAccountKey = blobStorageConfig.StorageAccountKey;
            var downloadDurationInDays = blobStorageConfig.DownloadDurationInDays;

            BlobContainerClient blobContainerClient = _blobServiceClient.GetBlobContainerClient(containerName);
            await blobContainerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob, cancellationToken: cancellationToken);

            string unescapedString = Uri.UnescapeDataString(request.BlobName);
            BlobClient blobClient = blobContainerClient.GetBlobClient($"documents/{unescapedString}");
            if (!await blobClient.ExistsAsync(cancellationToken))
            {
                throw new FileNotFoundException($"The blob '{unescapedString}' does not exist in container '{containerName}'.");
            }

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = containerName,
                BlobName = blobClient.Name,
                Resource = "b",
                ExpiresOn = DateTimeOffset.UtcNow.AddDays(downloadDurationInDays)
            };
            sasBuilder.SetPermissions(BlobContainerSasPermissions.Read);

            var sasQueryParameters = sasBuilder.ToSasQueryParameters(new StorageSharedKeyCredential(storageAccountName, storageAccountKey)); 
            var sasToken = sasQueryParameters.ToString();
            var finalUri = $"{blobClient.Uri.OriginalString}?{sasToken}";

            return new GetSasTokenResult(finalUri);
        }
    }
}
