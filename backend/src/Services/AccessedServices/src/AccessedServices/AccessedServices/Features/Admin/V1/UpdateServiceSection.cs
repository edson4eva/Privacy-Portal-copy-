using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Exceptions;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.AccessedServices.Services.Publish;
using AccessedServices.Data;
using FluentValidation;
using Libs.Audit;
using Libs.Web;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public record UpdateServiceSectionResult(ServiceSectionDto Dto);
    public record UpdateServiceSection(string ServiceId, string Index, ServiceSectionDto Dto) : IRequest<UpdateServiceSectionResult>;
    public class UpdateServiceSectionEndpoint : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPut($"{EndpointConfig.BaseApiPath}/services/{{ServiceId}}/sections/{{index}}",
            async (string ServiceId, string index, ServiceSectionDto dto, HttpContext httpContext, ILogger<UpdateServiceSectionEndpoint> logger, IAuditLogService auditLogService, IDraftServiceRepository serviceRepository, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new UpdateServiceSection(ServiceId, index, dto));
                return Results.Ok(result.Dto);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .AddEndpointFilter<PublishStatusCheckEndpointFilter>()
            .WithName("UpdateServiceSection")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<ServiceSectionDto>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Update the draft service section")
            .WithDescription("Update the draft service section")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
    public class UpdateServiceDetailSectionValidator : AbstractValidator<UpdateServiceSection>
    {
        public UpdateServiceDetailSectionValidator()
        {
            RuleFor(x => x.Dto.Title)
                .NotEmpty().WithMessage("Title is required");
            RuleFor(x => x.Dto.Content)
                .NotEmpty().WithMessage("Content is required");
        }
    }
    internal class UpdateServiceSectionHandler(IDraftServiceRepository serviceRepository, IPublishWorkflowManager publishWorkflowManager, 
        IAdminAuditLogService auditLogService) : IRequestHandler<UpdateServiceSection, UpdateServiceSectionResult>
    {
        public async Task<UpdateServiceSectionResult> Handle(UpdateServiceSection request, CancellationToken cancellationToken)
        {
            int index;
            if (!int.TryParse(request.Index, out index))
            {
                throw new InvalidIArrayIndexException();
            }
            var service = await serviceRepository.GetByIdAsync(request.ServiceId, new PartitionKey(request.ServiceId));
            if (service == null)
            {
                throw new ServiceNotFoundException();
            }
            if (service.Sections == null || service.Sections.Count <= index)
            {
                throw new InvalidIArrayIndexException();
            }
            var oldSection = new ServiceDataSection()
            {
                Title = service.Sections[index].Title,
                Content = service.Sections[index].Content
            };
            service.Sections[index].Title = request.Dto.Title;
            service.Sections[index].Content = request.Dto.Content;
            await serviceRepository.UpdateAsync(service, new PartitionKey(request.ServiceId));
            await publishWorkflowManager.NewDraftModification();
            auditLogService.LogUpdateServiceSection(request, oldSection, service);

            var dto = new ServiceSectionDto()
            {
                Title = request.Dto.Title,
                Content = request.Dto.Content
            };
            return new UpdateServiceSectionResult(dto);
        }
    }
}
