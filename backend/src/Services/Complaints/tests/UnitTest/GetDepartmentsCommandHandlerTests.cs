using Complaints.Complaints.Features.GettingDepartments.V1;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.UnitTest
{
    public class GetDepartmentsCommandHandlerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<IMapper> _mockMapper;
        private readonly GetDepartmentsHandler _handler;

        public GetDepartmentsCommandHandlerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _mockMapper = new Mock<IMapper>();
            _handler = new GetDepartmentsHandler();
        }

        [Fact]
        public async Task GetDepartments_ReturnOkResult_WithListOFDepartment()
        {
            // Arrange
            var departmentList = new List<DepartmentDto>
            {
                new DepartmentDto(DepartmentCodes.AdvancedEducation, "Advanced Education"),
                new DepartmentDto(DepartmentCodes.AffordabilityAndUtilities, "Affordability and Utilities")
            };

            var handlerMock = new Mock<IRequestHandler<GetDepartments, GetDepartmentsResult>>();
            handlerMock.Setup(m => m.Handle(It.IsAny<GetDepartments>(), It.IsAny<CancellationToken>()))
                        .ReturnsAsync(new GetDepartmentsResult(departmentList));
            
            // Act
            var response = await handlerMock.Object.Handle(new GetDepartments(), CancellationToken.None);

            // Assert
            Assert.NotNull(response);
            Assert.Equal(departmentList.Count, response.Departments.Count());
            Assert.Equal(departmentList, response.Departments);
        }

        [Fact]
        public async Task GetDepartments_NoDepartments_ReturnsEmptyList()
        {
            // Arrange
            var departmentList = new List<DepartmentDto>();

            var handlerMock = new Mock<IRequestHandler<GetDepartments, GetDepartmentsResult>>();
            handlerMock.Setup(m => m.Handle(It.IsAny<GetDepartments>(), It.IsAny<CancellationToken>()))
                        .ReturnsAsync(new GetDepartmentsResult(departmentList));

            // Act
            var response = await handlerMock.Object.Handle(new GetDepartments(), CancellationToken.None);

            // Assert
            Assert.NotNull(response);
            Assert.Empty(response.Departments);
        }

    }
}
