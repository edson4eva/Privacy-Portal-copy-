

namespace Complaints.UnitTest
{
    public class GetSasTokenCommandHandlerTests
    {
        [Fact]
        public async Task Handle_ShouldReturnUploadSasToken_ForValidConfiguration()
        {
            //Arrange
            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var mockBlobClient = new Mock<BlobClient>();
            var mockContainerClient = new Mock<BlobContainerClient>();

            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"AzureBlobStorage:ContainerName", "mockcontainer"},
                {"AzureBlobStorage:ConnectionString", ""},
                {"AzureBlobStorage:StorageAccountName", "mockstorageaccountname"},
                {"AzureBlobStorage:StorageAccountKey", "bW9jay1rZXk="},
                {"AzureBlobStorage:UploadDurationInMinutes", "30"}
            }).Build();

            mockBlobClient.Setup(x => x.ExistsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Response.FromValue(true, Mock.Of<Response>()));
            mockBlobClient.SetupGet(c => c.Uri).Returns(new Uri("https://mockaccount.blob.core.windows.net/mock-container/some-blob"));

            mockContainerClient.Setup(c => c.Uri).Returns(new Uri("https://mockaccount.blob.core.windows.net/mock-container"));
            mockContainerClient.Setup(x => x.GetBlobClient(It.IsAny<string>())).Returns(mockBlobClient.Object);
            mockBlobServiceClient.Setup(x => x.GetBlobContainerClient(It.IsAny<string>())).Returns(mockContainerClient.Object);

            var handler = new GetSasTokenHandler(mockBlobServiceClient.Object, configuration);

            //Act
            var result = await handler.Handle(new GetSasToken(), CancellationToken.None);

            //Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.Uri);
        }

        [Fact]
        public async Task Handle_ShouldReturnDownloadSasToken_ForValidConfiguration()
        {
            // Arrange
            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var mockBlobClient = new Mock<BlobClient>();
            var mockContainerClient = new Mock<BlobContainerClient>();

            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"AzureBlobStorage:ContainerName", "mockcontainer"},
                {"AzureBlobStorage:ConnectionString", ""},
                {"AzureBlobStorage:StorageAccountName", "mockstorageaccountname"},
                {"AzureBlobStorage:StorageAccountKey", "bW9jay1rZXk="},
                {"AzureBlobStorage:DownloadDurationInDays", "60"}
            }).Build();

            mockBlobClient.Setup(x => x.ExistsAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(Response.FromValue(true, Mock.Of<Response>()));
            mockBlobClient.SetupGet(c => c.Uri).Returns(new Uri("https://mockaccount.blob.core.windows.net/mock-container/some-blob"));
            mockBlobServiceClient.Setup(x => x.GetBlobContainerClient(It.IsAny<string>())).Returns(mockContainerClient.Object);
            mockContainerClient.Setup(x => x.GetBlobClient(It.IsAny<string>())).Returns(mockBlobClient.Object);

            var handler = new GetDownloadSasTokenHandler(mockBlobServiceClient.Object, configuration);

            // Act
            var result = await handler.Handle(new GetDownloadSasToken("blobname.png"), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.Uri);
        }

        [Fact]
        public async Task Handle_ShouldThrowFileNotFoundException_WhenBlobDoesNotExist()
        {
            // Arrange
            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var mockContainerClient = new Mock<BlobContainerClient>();
            var mockBlobClient = new Mock<BlobClient>();

            var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"AzureBlobStorage:ContainerName", "mockcontainer"},
                {"AzureBlobStorage:ConnectionString", ""},
                {"AzureBlobStorage:StorageAccountName", "mockstorageaccountname"},
                {"AzureBlobStorage:StorageAccountKey", "bW9jay1rZXk="}
            }).Build();

            mockBlobClient.Setup(x => x.ExistsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Response.FromValue(false, Mock.Of<Response>()));
            mockContainerClient.Setup(x => x.GetBlobClient(It.IsAny<string>())).Returns(mockBlobClient.Object);
            mockBlobServiceClient.Setup(x => x.GetBlobContainerClient(It.IsAny<string>())).Returns(mockContainerClient.Object);

            var handler = new GetDownloadSasTokenHandler(mockBlobServiceClient.Object, configuration);

            // Act & Assert
            await Assert.ThrowsAsync<FileNotFoundException>(() => handler.Handle(new GetDownloadSasToken("invalidblob"), CancellationToken.None));
        }

        [Fact]
        public async Task Handler_ThrowException_WhenMissingConfiguration()
        {
            //Arrange
            var mockBlobServiceClient = new Mock<BlobServiceClient>();
            var mockConfiguration = new Mock<IConfiguration>();

            mockConfiguration.Setup(c => c.GetSection("AzureBlobStorage")).Returns(null as IConfigurationSection);

            var handler = new GetSasTokenHandler(mockBlobServiceClient.Object, mockConfiguration.Object);

            //Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => handler.Handle(new GetSasToken(), CancellationToken.None));
        }
    }
}
