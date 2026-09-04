using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Features.GettingAccessedServiceDetails.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Microsoft.Azure.Cosmos;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UnitTest
{
    public class GetAccessedServiceDetailsHandlerTests
    {
        private readonly Mock<IAccessLogService> _mockAccessLogService;
        private readonly Mock<IServiceRepository> _mockServiceRepository;
        private readonly GetAccessedServicesDetailsHandler _handler;

        public GetAccessedServiceDetailsHandlerTests()
        {
            _mockAccessLogService = new Mock<IAccessLogService>();
            _mockServiceRepository = new Mock<IServiceRepository>();
            _handler = new GetAccessedServicesDetailsHandler(_mockAccessLogService.Object, _mockServiceRepository.Object);
        }

        [Fact]
        public async Task Handler_ShouldThrowsServiceNotFoundException_WhenServiceNotFoundInRepository()
        {
            // Arrange
            var request = new GetAccessedServiceDetails("user123", "service123");

            _mockServiceRepository
                .Setup(repo => repo.GetByIdAsync(It.IsAny<string>(), It.IsAny<PartitionKey>()))
                .ReturnsAsync((Service?)null);

            // Act & Assert
            await Assert.ThrowsAsync<ServiceNotFoundException>(() => _handler.Handle(request, CancellationToken.None));
        }

        [Fact]
        public async Task Handler_ShouldThrowsServiceNotFoundException_WhenServiceNotAvailable()
        {
            // Arrange
            var request = new GetAccessedServiceDetails("user123", "service123");
            var service = new Service { Id = "service1", ServiceName = "service 1", Origin = Origin.UIAM, CategoryId = "badge text", IsAvailable = false };

            _mockServiceRepository
                .Setup(repo => repo.GetByIdAsync(service.Id, It.IsAny<PartitionKey>()))
                .ReturnsAsync(service);

            // Act & Assert
            await Assert.ThrowsAsync<ServiceNotFoundException>(() => _handler.Handle(request, CancellationToken.None));
        }

        [Fact]
        public async Task Handler_ShouldThrowsServiceNotFoundException_WhenAccessedServiceNotFound()
        {
            // Arrange
            var request = new GetAccessedServiceDetails("user123", "service123");
            var service = new Service { Id = "service1", ServiceName = "service 1", Origin = Origin.UIAM, CategoryId = "badge text", IsAvailable = true };
            var accessedServicesResult = new AccessedServicesResult() { IsUIAMStale = false, IsEServiceStale = false, AccessedServices = new List<AccessedService>() };

            _mockServiceRepository
                .Setup(repo => repo.GetByIdAsync(It.IsAny<string>(), It.IsAny<PartitionKey>()))
                .ReturnsAsync(service);

            _mockAccessLogService
                .Setup(logService => logService.GetUserAccessedServicesAsync(It.IsAny<string>()))
                .ReturnsAsync(accessedServicesResult);

            // Act & Assert
            await Assert.ThrowsAsync<ServiceNotFoundException>(() => _handler.Handle(request, CancellationToken.None));
        }

        [Fact]
        public async Task Handler_ShouldReturnAccessedServiceDetails_WhenServiceAvailable()
        {
            // Arrange
            var request = new GetAccessedServiceDetails("user123", "service123");
            var metadata = new Mock<ServiceMetadata>();
            var service = new Service
            {
                Id = "service123",
                ServiceName = "service 123",
                Origin = Origin.UIAM,
                CategoryId = "Badge1",
                IsAvailable = true
            };

            var accessedServicesResult = new AccessedServicesResult()
            {
                IsUIAMStale = false,
                IsEServiceStale= false,
                AccessedServices = new List<AccessedService>
                {
                    new AccessedService { Id = "service123", Name = "Service 123", AccessedDates = [new DateTime(2025,1,1)], Category = "category1"}
                }
            };

            _mockServiceRepository
                .Setup(repo => repo.GetByIdAsync(It.IsAny<string>(), It.IsAny<PartitionKey>()))
                .ReturnsAsync(service);

            _mockAccessLogService
                .Setup(logService => logService.GetUserAccessedServicesAsync(It.IsAny<string>()))
                .ReturnsAsync(accessedServicesResult);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            var dto = result.AccessedServiceDetails;
            Assert.NotNull(dto.ServiceDetails);
            Assert.Equal("service123", dto.ServiceDetails.Id);
            Assert.Equal("service 123", dto.ServiceDetails.ServiceName);
            Assert.NotNull(dto.AccessedDates);
            Assert.Contains(new DateTime(2025, 1, 1), dto.AccessedDates);
            Assert.Equal("Badge1", dto.ServiceDetails.CategoryId);
        }
    }
}
