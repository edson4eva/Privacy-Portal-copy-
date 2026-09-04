using Complaints.Data;
using Libs.Web;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Complaints.Complaints.Features.GettingDepartments.V1
{
    public record DepartmentDto(string Code, string DisplayName);
    public record GetDepartments() : IRequest<GetDepartmentsResult>;
    public record GetDepartmentsResult(IEnumerable<DepartmentDto> Departments);
    public record GetDepartmentsResponseDto(IEnumerable<DepartmentDto> Departments);
    
    public class GetDepartmentsEndpoint : IMinimalEndpoint
    {   
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapGet($"{EndpointConfig.BaseApiPath}/departments",
            async (IMediator mediator, IMapper mapper, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new GetDepartments(), cancellationToken);

                var response = result.Adapt<GetDepartmentsResponseDto>();

                return Results.Ok(response);
            })
            //.RequireAuthorization() //TODO: uncomment after authorization issues are fixed
            .WithName("GetDepartments")
            .WithApiVersionSet(builder.NewApiVersionSet("Complaint").Build())
            .Produces<GetDepartmentsResponseDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Get Departments")
            .WithDescription("Get the list of Departments that can be associated with a complaint.")
            .WithOpenApi()
            .HasApiVersion(1.0)
            .RequireCors();

            return builder;
        }
    }

    internal class GetDepartmentsHandler : IRequestHandler<GetDepartments, GetDepartmentsResult>
    {
        public Task<GetDepartmentsResult> Handle(GetDepartments request, CancellationToken cancellationToken)
        {
            var departments = DepartmentData.Departments.Select(department => new DepartmentDto(department.Code,department.DisplayName));

            return Task.FromResult(new GetDepartmentsResult(departments));
        }
    }
}
