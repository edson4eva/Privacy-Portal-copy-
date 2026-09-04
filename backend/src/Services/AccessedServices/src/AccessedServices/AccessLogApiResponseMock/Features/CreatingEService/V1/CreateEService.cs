using FluentValidation;
using Libs.Web;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mapster;
using AccessedServices.Data.AccessLogApiResponseMock;
using AccessedServices.AccessLogApiResponseMock.Models;
using AccessedServices.AccessedServices.Services;

namespace AccessedServices.AccessLogApiResponseMock.Features.CreatingEService.V1
{
    public record CreateEService(string Id, DateTime[] AccessedDates) : IRequest<CreateEServiceResult>;
    public record CreateEServiceRequestDto(string Id, DateTime[] AccessedDates);
    public record CreateEServiceResponseDto(string Id, DateTime[] AccessedDates);
    public record CreateEServiceResult(string Id, DateTime[] AccessedDates);
    public class CreateEServiceEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/mock-api-response/e-service",
                async (CreateEServiceRequestDto request, IMapper mapper, IMediator mediator, CancellationToken cancellationToken) =>
                {
                    var command = mapper.Map<CreateEService>(request);
                    var result = await mediator.Send(command, cancellationToken);

                    var response = result.Adapt<CreateEServiceResponseDto>();

                    return Results.Ok(response);
                })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("CreateAnEServiceForMockApiResponse")
            .WithApiVersionSet(builder.NewApiVersionSet("AccessLogApiResponseMock").Build())
            .Produces<CreateEServiceResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .WithSummary("Creates an EService for mock api response.")
            .WithDescription("Creates an EService for mock api response. If accessed dates are not provided, it will create 5 random dates.")
            .WithOpenApi()
            .HasApiVersion(1.0);
            return builder;
        }

        public class CreateEServiceValidator : AbstractValidator<CreateEService>
        {
            public CreateEServiceValidator()
            {
                RuleFor(x => x.Id).NotNull().WithMessage("The Id is required!");
            }
        }

        internal class CompleteRegisterPassengerCommandHandler : IRequestHandler<CreateEService, CreateEServiceResult>
        {
            private readonly IMapper _mapper;
            private readonly IMockApiResponseEServiceRepository _mockApiResponseEServiceRepository;
            public CompleteRegisterPassengerCommandHandler(IMapper mapper, IMockApiResponseEServiceRepository mockApiResponseEServiceRepository)
            {
                _mapper = mapper;
                _mockApiResponseEServiceRepository = mockApiResponseEServiceRepository;
            }
            public async Task<CreateEServiceResult> Handle(CreateEService request, CancellationToken cancellationToken)
            {
                var eService = _mapper.Map<MockApiResponseEService>(request);
                if (eService.AccessedDates == null || eService.AccessedDates.Length==0)
                {
                    eService.AccessedDates = GetRandomAccessDates();
                }
                await _mockApiResponseEServiceRepository.AddAsync(eService);
                var response = await _mockApiResponseEServiceRepository.GetByIdAsync(eService.Id);
                var result = _mapper.Map<CreateEServiceResult>(response!);
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
