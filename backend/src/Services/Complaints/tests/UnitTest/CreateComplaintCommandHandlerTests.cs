namespace Complaints.UnitTest
{
    public class CreateComplaintCommandHandlerTests
    {
        private readonly Mock<IComplaintRepository> _complaintRepositoryMock;
        private readonly Mock<ICurrentUserProvider> _currentUserProviderMock;
        private readonly Mock<IHttpContextAccessor> _contextAccessorMock;
        private readonly CreateComplaintCommandHandler _handler;

        public CreateComplaintCommandHandlerTests()
        {
            _complaintRepositoryMock = new Mock<IComplaintRepository>();
            _currentUserProviderMock = new Mock<ICurrentUserProvider>();
            _contextAccessorMock = new Mock<IHttpContextAccessor>();

            _handler = new CreateComplaintCommandHandler(
                _complaintRepositoryMock.Object, _currentUserProviderMock.Object, _contextAccessorMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_ShouldCreateComplaint()
        {
            //Arrange
            var command = new CreateComplaint(new CreateComplaintDto
            {
                Department = "Advanced Education",
                Concern = "Unauthorized access",
                Circumstances = "Any which violates client's privacy rights",
                ComplaineeContactInfo = new ComplaineeContactInfoDto { Email = "tsmith@outlook.com", FirstName = "Thomas", LastName = "Smith" },
                Documents = new List<DocumentDto>()
            });

            _complaintRepositoryMock.Setup(repo => repo.AddAsync(It.IsAny<Complaint>(), It.IsAny<PartitionKey>())).Returns(Task.CompletedTask);

            //Act
            var result = await _handler.Handle(command, CancellationToken.None);

            //Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal(DateTime.UtcNow.Date, result.createdDate.Date);
        }

        [Fact]
        public void Validator_WithNullComplaineeContactInfo_ShouldFail()
        {
            //Arrange
            var command = new CreateComplaint(new CreateComplaintDto
            {
                Department = "Advanced Education",
                Concern = "Unauthorized access",
                Circumstances = "Any which violates client's privacy rights",
                ComplaineeContactInfo = null,
                Documents = new List<DocumentDto>()
            });

            var validator = new CreateComplaintValidator();

            //Act
            var result = validator.Validate(command);

            //Assert
            var error = Assert.Single(result.Errors, e => e.PropertyName == "CreateComplaintDto.ComplaineeContactInfo");
            
            Assert.False(result.IsValid);
            Assert.Equal("ComplaineeContactInfo is required.", error.ErrorMessage);
        }

        [Fact]
        public async Task Handle_WithNullCommand_ShouldThrowArgumentNullException()
        {
            //Arrange
            CreateComplaint? command = null;

            //Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        }

    }
}
