

namespace Complaints.UnitTest
{
    public class SendEmailHandlerTests
    {
        private readonly Mock<INotificationService> _notificationServiceMock;
        private readonly IConfiguration _configuration;
        private readonly SendEmailHandler _handler;

        public SendEmailHandlerTests()
        {
            _notificationServiceMock = new Mock<INotificationService>();
            _configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"AbNotify:ConfirmationEmailToAlbertanTemplateGuid", "user-template-guid"},
                {"AbNotify:PrivacyServiceAdvisorEmailTemplateGuid", "advisor-template-guid"},
                {"AbNotify:PrivacyServiceAdvisorEmailAddress", "testadvisor@test.com"}
            }).Build();

            _handler = new SendEmailHandler(_notificationServiceMock.Object, _configuration);
        }

        [Fact]
        public async Task Handle_BothEmailsSentSuccessfully_ReturnsSuccessResult()
        {
            //Arrange
            var request = new SendEmailRequest(new Personalisation
            {
                Department = "Advanced Education",
                ServiceName = "Advanced Education",
                PrivacyConcern = "Overcollection",
                Circumstances = "Reason to submit a complaint",
                EmployeeName = "Charles De Gaule",
                FirstName = "Jack",
                LastName = "Reacher",
                UserEmail = "jack.reacher@test.com",
                DocumentLinks = "Document Link",
                DocumentDescription = "Document Description",
                DateOfSubmission = DateTime.Now.ToShortDateString(),
                TimeOfSubmission = DateTime.Now.ToShortTimeString(),
                AccountType = "guest"
            });

            // Set up mock behavior for each email send
            _notificationServiceMock.Setup(s => s.Send("advisor-template-guid", "testadvisor@test.com", It.IsAny<Personalisation>()))
                                    .ReturnsAsync(true);

            var acknowledgmentPersonalization = new Personalisation { Department = request.Personalisation.Department };

            _notificationServiceMock.Setup(s => s.Send("user-template-guid", "jack.reacher@test.com", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)))
                                    .ReturnsAsync(true);

            //Act
            var result = await _handler.Handle(request, CancellationToken.None);

            //Assert
            Assert.True(true);
            Assert.Equal("Both email are sent successfully", result.Message);

            _notificationServiceMock.Verify(v => v.Send("advisor-template-guid", "testadvisor@test.com", request.Personalisation), Times.Once);
            _notificationServiceMock.Verify(v => v.Send("user-template-guid", "jack.reacher@test.com", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)), Times.Once);
        }

        [Fact]
        public async Task Handle_AdvisorEmailFails_ReturnsFailureResult()
        {
            // Arrange
            var request = new SendEmailRequest(new Personalisation
            {
                Department = "Advanced Education",
                ServiceName = "Advanced Education",
                PrivacyConcern = "Inaccurate information",
                Circumstances = "Reason to submit a complaint",
                EmployeeName = "Charles De Gaule",
                FirstName = "Jack",
                LastName = "Reacher",
                UserEmail = "jack.reacher@test.com",
                DocumentLinks = "Document Link",
                DocumentDescription = "Document Description",
                DateOfSubmission = DateTime.Now.ToShortDateString(),
                TimeOfSubmission = DateTime.Now.ToShortTimeString(),
                AccountType = "guest"
            });

            _notificationServiceMock
                .Setup(x => x.Send("advisor-template-guid", "testadvisor@test.com", request.Personalisation))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Failed to send email for newly filed complaint.", result.Message);

            _notificationServiceMock.Verify(v => v.Send("advisor-template-guid", "testadvisor@test.com", request.Personalisation), Times.Once);
        }

        [Fact]
        public async Task Handle_AcknowledgmentEmailFails_ReturnsFailureResult()
        {
            // Arrange
            var request = new SendEmailRequest(new Personalisation
            {
                Department = "Advanced Education",
                ServiceName = "Advanced Education",
                PrivacyConcern = "Unauthorized access",
                Circumstances = "Reason to submit a complaint",
                EmployeeName = "Charles De Gaule",
                FirstName = "Jack",
                LastName = "Reacher",
                UserEmail = "jack.reacher@test.com",
                DocumentLinks = "Document Link",
                DocumentDescription = "Document Description",
                DateOfSubmission = DateTime.Now.ToShortDateString(),
                TimeOfSubmission = DateTime.Now.ToShortTimeString(),
                AccountType = "guest"
            });

            _notificationServiceMock.Setup(s => s.Send("advisor-template-guid", "testadvisor@test.com", It.IsAny<Personalisation>()))
                                    .ReturnsAsync(true);
            var acknowledgmentPersonalization = new Personalisation { Department = request.Personalisation.Department };
            _notificationServiceMock.Setup(s => s.Send("user-template-guid", "jack.reacher@test.com", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)))
                                    .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Failed to send the acknowledgment email.", result.Message);

            _notificationServiceMock.Verify(x => x.Send("advisor-template-guid", "testadvisor@test.com", request.Personalisation), Times.Once);
            _notificationServiceMock.Verify(v => v.Send("user-template-guid", "jack.reacher@test.com", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidEmailFormat_ReturnsFailureResult()
        {
            // Arrange
            var request = new SendEmailRequest(new Personalisation
            {
                Department = "Advanced Education",
                ServiceName = "Advanced Education",
                PrivacyConcern = "Unauthorized access",
                Circumstances = "Reason to submit a complaint",
                EmployeeName = "Charles De Gaule",
                FirstName = "Jack",
                LastName = "Reacher",
                UserEmail = "invalid-email-format",
                DocumentLinks = "Document Link",
                DocumentDescription = "Document Description",
                DateOfSubmission = DateTime.Now.ToShortDateString(),
                TimeOfSubmission = DateTime.Now.ToShortTimeString(),
                AccountType = "guest"
            });

            _notificationServiceMock
                .Setup(x => x.Send("advisor-template-guid", "testadvisor@test.com", It.IsAny<Personalisation>()))
                .ReturnsAsync(true);

            _notificationServiceMock
                .Setup(x => x.Send("user-template-guid", "invalid-email-format", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.False(result.Success);
            Assert.True(result.Message == "Failed to send email for newly filed complaint." || 
                        result.Message == "Failed to send the acknowledgment email.");

            _notificationServiceMock.Verify(x => x.Send("advisor-template-guid", "testadvisor@test.com", request.Personalisation), Times.Once);
            _notificationServiceMock.Verify(x => x.Send("user-template-guid", "invalid-email-format", It.Is<Personalisation>(p => p.Department == request.Personalisation.Department)), Times.Once);
        }
    }
}
