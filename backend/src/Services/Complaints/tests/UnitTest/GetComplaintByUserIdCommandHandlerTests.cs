

namespace Complaints.UnitTest
{
    public class GetComplaintByUserIdCommandHandlerTests
    {
        private readonly Mock<IMapper> _mockMapper;
        private readonly Mock<IComplaintRepository> _mockComplaintRespository;
        private readonly GetComplaintsByUserIdHandler _handler;

        public GetComplaintByUserIdCommandHandlerTests()
        {
            _mockMapper = new Mock<IMapper>();
            _mockComplaintRespository = new Mock<IComplaintRepository>();
            _handler = new GetComplaintsByUserIdHandler(_mockMapper.Object, _mockComplaintRespository.Object);
        }

        [Fact]
        public async Task Handle_WithValidRequest_ReturnsExpectedResult()
        {
            //Arrange
            var userId = "user123";
            var complaints = new List<Complaint> { new Complaint
                {
                    Id = "1",
                    UserId = userId,
                    IsUserGuest = false,
                    RecaptchaId = "",
                    Department = "Advanced Education",
                    Concern = "Unauthorized access",
                    Circumstances = "",
                    ComplaineeContactInfo = new ComplaineeContactInfo { Email = "tsmith@outlook.com", FirstName = "Thomas", LastName = "Smith" },
                    ComplaintId = "complaint123",
                    CreatedDate = new DateTime(),
                    Documents = new List<Document>(),
                } 
            };

            var complaintDtos = new List<GetComplaintDto>
            {
                new GetComplaintDto
                {
                    Department = "Childcare Servuces",
                    Service = "Child adoption process",
                    Concern = "Unauthorized access",
                    Circumstances = "Lorem ipsum",
                    EmployeeName = "John Doe",
                    ComplaineeContactInfo = new ComplaineeContactInfoDto
                    {
                        FirstName = "Jane", 
                        LastName= "Smith",
                        Email = "jane.smith@outlook.com"
                    },
                    Documents =
                    [
                        new DocumentDto
                        {
                            Documentation = "list of required files",
                            Files =
                            [
                                new FileDetailDto
                                {
                                    FileType = "pdf",
                                    FileName = "test.pdf",
                                    Url = "https://icloud.com/test.pdf"
                                }
                            ]
                        }
                    ],
                    ComplaintId = "comp123",
                    CreatedDate = DateTime.Now
                }
            };

            _mockComplaintRespository.Setup(repo => repo.GetComplaintsByUserIdAsync(userId)).ReturnsAsync(complaints);
            _mockMapper.Setup(m => m.Map<IEnumerable<GetComplaintDto>>(complaints)).Returns(complaintDtos);

            var request = new GetComplaintsByUserId(userId);

            //Act
            var result = await _handler.Handle(request, CancellationToken.None);

            //Assert
            Assert.NotNull(result);
            Assert.Equal(result.Complaints, complaintDtos);
        }
    }
}
