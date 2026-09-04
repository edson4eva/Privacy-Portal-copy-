using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessLogApiResponseMock.Models;
using AccessedServices.Data.AccessLogApiResponseMock;
using FluentValidation;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AccessedServices.AccessLogApiResponseMock.Features.CreatingUIAMData.V1
{
    public record CreateUIAMData(string Id, DateTime[] AccessedDates) : IRequest<CreateUIAMDataResult>;
    public record CreateUIAMDataRequestDto(string Id, DateTime[] AccessedDates);
    public record CreateUIAMDataResponseDto(string Id, DateTime[] AccessedDates);
    public record CreateUIAMDataResult(string Id, DateTime[] AccessedDates);
    public class CreateUIAMDataEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/mock-api-response/uiam-data",
                async (CreateUIAMDataRequestDto request, IMapper mapper, IMediator mediator, CancellationToken cancellationToken) =>
                {
                    var command = mapper.Map<CreateUIAMData>(request);
                    var result = await mediator.Send(command, cancellationToken);

                    var response = result.Adapt<CreateUIAMDataResponseDto>();

                    return Results.Ok(response);
                })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("CreateAUIAMDataForMockApiResponse")
            .WithApiVersionSet(builder.NewApiVersionSet("AccessLogApiResponseMock").Build())
            .Produces<CreateUIAMDataResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Creates a UIAMData for mock api response.")
            .WithDescription("Creates a UIAMData for mock api response. If accessed dates are not provided, it will create 5 random dates.")
            .WithOpenApi()
            .HasApiVersion(1.0);
            return builder;
        }

        public class CreateUIAMDataValidator : AbstractValidator<CreateUIAMData>
        {
            public CreateUIAMDataValidator()
            {
                RuleFor(x => x.Id).NotNull().WithMessage("The Id is required!");
            }
        }

        internal class CompleteRegisterPassengerCommandHandler : IRequestHandler<CreateUIAMData, CreateUIAMDataResult>
        {
            private readonly IMapper _mapper;
            private readonly IMockApiResponseUIAMRepository _mockApiResponseUIAMRepository;
            public CompleteRegisterPassengerCommandHandler(IMapper mapper, IMockApiResponseUIAMRepository mockApiResponseUIAMRepository)
            {
                _mapper = mapper;
                _mockApiResponseUIAMRepository = mockApiResponseUIAMRepository;
            }
            public async Task<CreateUIAMDataResult> Handle(CreateUIAMData request, CancellationToken cancellationToken)
            {
                var uiamData = _mapper.Map<MockApiResponseUIAM>(request);
                if (uiamData.AccessedDates == null || uiamData.AccessedDates.Length == 0)
                {
                    uiamData.AccessedDates = GetRandomAccessDates();
                }
                await _mockApiResponseUIAMRepository.AddAsync(uiamData);
                var response = await _mockApiResponseUIAMRepository.GetByIdAsync(uiamData.Id);
                var result = _mapper.Map<CreateUIAMDataResult>(response!);
                return result;
            }

            private DateTime[] GetRandomAccessDates()
            {
                var random = new Random();
                var startDate = new DateTime(2024, 10, 1);
                var endDate = DateTime.Now;

                return Enumerable.Range(0, 5)
                                 .Select(_ => startDate.AddDays(random.Next((endDate - startDate).Days + 1)))
                                 .ToArray();
            }
        }
    }
}
