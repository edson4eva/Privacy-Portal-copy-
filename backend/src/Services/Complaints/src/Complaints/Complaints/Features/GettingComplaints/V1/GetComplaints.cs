using Complaints.Complaints.Dtos;
using Complaints.Data;
using FluentValidation;
using GoA.UiamRpClientLib.Identity;
using Libs.Auth;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Complaints.Complaints.Features.GettingComplaints.V1
{
    public record GetComplaintsByUserId(string UserId) : IRequest<GetComplaintsByUserIdResult>;

    public record GetComplaintsByUserIdResult(IEnumerable<GetComplaintDto> Complaints);

    public record GetComplaintsByUserIdResponseDto(IEnumerable<GetComplaintDto> Complaints);

    public class GetComplaints : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/complaints",
            async (HttpContext httpContext, IMediator mediator, IMapper mapper, CancellationToken cancellationToken) =>
            {
                var user = (httpContext.User as User);
                if (user == null)
                {
                    throw new InvalidOperationException("Couldn't resolve user.");
                }
                if (user.PrimaryEmailAddress == null)
                {
                    throw new InvalidOperationException("Couldn't resolve email address.");
                }

                var result = await mediator.Send(new GetComplaintsByUserId(user.PrimaryEmailAddress));
                var response = result.Adapt<GetComplaintsByUserIdResponseDto>();

                return Results.Ok(response);
            })
            .RequireAuthorization()
            .WithName("GetComplaints")
            .WithApiVersionSet(builder.NewApiVersionSet("Complaint").Build())
            .Produces<GetComplaintsByUserIdResponseDto>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Get Complaints by User ID")
            .WithDescription("Get Complaints by User ID")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }

    public class GetComplaintsByUserIdValidator : AbstractValidator<GetComplaintsByUserId>
    {
        public GetComplaintsByUserIdValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required!");
        }
    }

    internal class GetComplaintsByUserIdHandler : IRequestHandler<GetComplaintsByUserId, GetComplaintsByUserIdResult>
    {
        private readonly IMapper _mapper;
        private readonly IComplaintRepository _complaintRepository;

        public GetComplaintsByUserIdHandler(IMapper mapper, IComplaintRepository complaintRepository)
        {
            _mapper = mapper;
            _complaintRepository = complaintRepository;
        }

        public async Task<GetComplaintsByUserIdResult> Handle(GetComplaintsByUserId request, CancellationToken cancellationToken)
        {
            var complaints = await _complaintRepository.GetComplaintsByUserIdAsync(request.UserId);
            var complaintDtos = _mapper.Map<IEnumerable<GetComplaintDto>>(complaints);

            return new GetComplaintsByUserIdResult(complaintDtos);
        }
    }
}
