using Ardalis.GuardClauses;
using Complaints.Complaints.Dtos;
using Complaints.Complaints.Models;
using Complaints.Data;
using FluentValidation;
using Libs.Audit;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;

namespace Complaints.Complaints.Features.CreatingComplaints.V1
{
    public record CreateComplaint(CreateComplaintDto CreateComplaintDto) : IRequest<CreateComplaintResult>
    {
        public Guid Id { get; init; } = Guid.NewGuid();
    }

    public record CreateComplaintResult(Guid Id, DateTime createdDate);

    public record CreateComplaintRequestDto(string Department, string? Service, string Concern, string Circumstances, string? EmployeeName, ComplaineeContactInfoDto ComplaineeContactInfo, List<DocumentDto> Documents);

    public record CreateComplaintResponseDto(Guid Id, DateTime createdDate);

    public class CreateComplaintEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/complaints", async (CreateComplaintRequestDto requestDto
                , IMediator mediator
                , IMapper mapper
                , IAuditLogService auditLogService
                , CancellationToken cancellationToken) =>
            {
                var command = mapper.Map<CreateComplaint>(requestDto);

                var result = await mediator.Send(command, cancellationToken);

                var response = result.Adapt<CreateComplaintResponseDto>();

                auditLogService.LogCreate(ServiceCategory.Complaints, "CreateComplaint", requestDto, response);

                return Results.Ok(response);
            })
            .WithName("CreateComplaint")
            .WithApiVersionSet(builder.NewApiVersionSet("Complaints").Build())
            .Produces<CreateComplaintResponseDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Create Complaint")
            .WithOpenApi()
            .HasApiVersion(1.0);
            
            return builder;
        }
    }

    public class CreateComplaintValidator : AbstractValidator<CreateComplaint>
    {
        public CreateComplaintValidator()
        {
            RuleFor(x => x.CreateComplaintDto.Department)
                .NotEmpty().WithMessage("Department is required.")
                .Must(department => DepartmentData.Departments.Any(d => d.Code == department))
                  .WithMessage("Invalid department.");
            RuleFor(x => x.CreateComplaintDto.Concern).NotEmpty().WithMessage("Concern is required.");
            RuleFor(x => x.CreateComplaintDto.Circumstances).NotEmpty().WithMessage("Circumstance is required.");
            RuleFor(x => x.CreateComplaintDto.ComplaineeContactInfo).NotNull().WithMessage("ComplaineeContactInfo is required.");
        }
    }

    internal class CreateComplaintCommandHandler : IRequestHandler<CreateComplaint, CreateComplaintResult>
    {
        private readonly IComplaintRepository _complaintRepository;
        private readonly ICurrentUserProvider _currentUserProvider;
        private readonly IHttpContextAccessor _contextAccessor;

        public CreateComplaintCommandHandler(IComplaintRepository complaintRepository, ICurrentUserProvider currentUserProvider, IHttpContextAccessor contextAccessor)
        {
            _complaintRepository = complaintRepository;
            _currentUserProvider = currentUserProvider;
            _contextAccessor = contextAccessor;
        }

        public async Task<CreateComplaintResult> Handle(CreateComplaint command, CancellationToken cancellationToken)
        {
            Guard.Against.Null(command, nameof(command)); 

            var httpContext = _contextAccessor.HttpContext;
            var user = httpContext?.User as GoA.UiamRpClientLib.Identity.User;
            string userId;
            bool isUserGuest = true;

            var createComplaintDto = command.CreateComplaintDto;

            var complaineeContactInfo = new ComplaineeContactInfo
            {
                FirstName = createComplaintDto.ComplaineeContactInfo.FirstName,
                LastName = createComplaintDto.ComplaineeContactInfo.LastName,
                Email = createComplaintDto.ComplaineeContactInfo.Email
            };

            var documents = createComplaintDto.Documents?.Select(document => new Document
            {
                Documentation = document.Documentation,
                Files = document.Files?.Select(file => new FileDetail
                {
                    FileType = file.FileType,
                    FileName = file.FileName,
                    Url = file.Url
                }).ToList() ?? new List<FileDetail>(),
                UploadedDateTime = DateTime.UtcNow,
                ReferenceId = Guid.NewGuid().ToString(),
            }).ToList();

            if (user != null && user.PrimaryEmailAddress != null)
            {
                userId = user.PrimaryEmailAddress;
                isUserGuest = false;
            }
            else
            {
                userId = createComplaintDto.ComplaineeContactInfo.Email;
            }

            var complaint = new Complaint
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId, 
                IsUserGuest = isUserGuest,
                RecaptchaId = Guid.NewGuid().ToString(),
                Department = createComplaintDto.Department,
                Service = createComplaintDto.Service,
                Concern = createComplaintDto.Concern,
                Circumstances = createComplaintDto.Circumstances,
                EmployeeName = createComplaintDto.EmployeeName,
                ComplaineeContactInfo = complaineeContactInfo,
                Documents = documents,
                ComplaintId = command.Id.ToString(),
                CreatedDate = DateTime.UtcNow
            };

            await _complaintRepository.AddAsync(complaint, new PartitionKey(complaint.UserId));

            return new CreateComplaintResult(Guid.Parse(complaint.ComplaintId), complaint.CreatedDate);
        }
    }
}
