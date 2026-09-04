using AccessedServices.AccessedServices.Features.GettingAccessedServices.V1;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using Dapr.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
namespace UnitTest
{
    public class GetAccessedServicesHandlerTests
    {
        private readonly GetAccessedServicesHandler _handler;
        private readonly Mock<IAccessLogService> _mockAccessLogService;

        public Task<GetAccessedServicesResult> Act(GetAccessedServices request, CancellationToken cancellationToken) =>
            _handler.Handle(request, cancellationToken);

        public GetAccessedServicesHandlerTests()
        {
            _mockAccessLogService = new Mock<IAccessLogService>();
            _handler = new GetAccessedServicesHandler(_mockAccessLogService.Object);
        }

        [Fact]
        public async Task Handler_WithValidRequest_ShouldReturnAccessedServices()
        {
            //Arrange
            var userId = "test@test.com";
            _mockAccessLogService.Setup(_ => _.GetUserAccessedServicesAsync(userId)).ReturnsAsync(new AccessedServicesResult()
            {
                IsUIAMStale = false,
                IsEServiceStale = false,
                AccessedServices = new List<AccessedService>() {
                    new AccessedService()
                    {
                        Id = "child-care-subsidy",
                        Name = "Child Care Subsidy",
                        IsAvailable = true,
                        AccessedDates = [new DateTime(2024,11,21), new DateTime(2024, 10, 14)],
                        Category = "category1"
                    }
                }
            });
            var request = new GetAccessedServices("test@test.com");

            // Act
            var response = await Act(request, CancellationToken.None);

            //Assert
            Assert.NotNull(response.AccessedServices);
            Assert.Single(response.AccessedServices);
        }

        [Fact]
        public async Task Handler_WithValidRequest_ShouldReturnAccessedServicesWithLastAccessedDate()
        {
            //Arrange
            var userId = "test@test.com";
            _mockAccessLogService.Setup(_ => _.GetUserAccessedServicesAsync(userId)).ReturnsAsync(new AccessedServicesResult()
            {
                IsUIAMStale = false,
                IsEServiceStale = false,
                AccessedServices = new List<AccessedService>() {
                    new AccessedService()
                    {
                        Id = "child-care-subsidy",
                        Name = "Child Care Subsidy",
                        IsAvailable = true,
                        AccessedDates = [new DateTime(2024,11,21), new DateTime(2024, 10, 14)],
                        Category = "category1"
                    },
                    new AccessedService()
                    {
                        Id = "drivers-licence-renewal",
                        Name = "Driver’s licence renewal",
                        IsAvailable = true,
                        AccessedDates = [new DateTime(2024,9,15), new DateTime(2024, 7, 17)],
                        Category = "category1"
                    }
                }
            });
            var request = new GetAccessedServices("test@test.com");

            // Act
            var response = await Act(request, CancellationToken.None);

            //Assert
            Assert.Equal(2, response.AccessedServices.Count());
            Assert.Equal(new DateTime(2024, 11, 21), response.AccessedServices.First().LastAccessedOn);
            Assert.Equal(new DateTime(2024, 9, 15), response.AccessedServices.Last().LastAccessedOn);
        }
    }
}