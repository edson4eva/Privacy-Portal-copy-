using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using AccessedServices.AccessedServices.Services;
using AccessedServices.Data;
using GoA.UiamRpClientLib.Identity;
using Libs.Audit;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Extensions.Logging;
using static AccessedServices.AccessedServices.Features.Admin.V1.GetAuditLog;

namespace AccessedServices.AccessedServices.Features.Admin.V1
{
    public class GetAuditLog : IMinimalEndpoint
    {
        public record AuditLogFilterDto(string? UserId, string? Pattern, List<string>? Actions, string? BeginDate, string? EndDate);
        public record GetAuditLogListResult(IEnumerable<AuditLogDto> auditLogs);
        public record GetAuditLogReq(AuditLogFilterDto Dto) : IRequest<GetAuditLogListResult>;
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/auditLogs",
            async (AuditLogFilterDto dto, HttpContext httpContext, ILogger<string> logger, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new GetAuditLogReq(dto));
                return Results.Ok(result);
            })
            .RequireAuthorization(AdminRoleRequirement.ADMIN_POLICY)
            .WithName("auditLogs")
            .WithApiVersionSet(builder.NewApiVersionSet("Accesses").Build())
            .Produces<GetAuditLogListResult>()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .WithSummary("Return list of AuditLogs")
            .WithDescription("Get the list of audit logs in the admin portal")
            .WithOpenApi()
            .HasApiVersion(1.0);

            return builder;
        }
    }
    internal class GetAuditLogHandler(IAuditLogRepository repo, ILogger<GetAuditLogHandler> logger) : IRequestHandler<GetAuditLogReq, GetAuditLogListResult>
    {
        public IEnumerable<AuditLog> ProcessLogs(IEnumerable<AuditLog> logs)
        {
            var result = new List<AuditLog>();
            foreach (var log in logs)
            {
                switch (log.Action)
                {
                    case AuditLogActionCategory.RollbackAction:
                    default:
                        break;
                }
            }
            return result;
        }
        public static string MapAction(string action)
        {
            switch (action)
            {
                case AuditLogActionCategory.AddService:
                    return AuditLogDto.AddServiceAction;
                case AuditLogActionCategory.AddServiceSection:
                case AuditLogActionCategory.UpdateServiceSection:
                case AuditLogActionCategory.DeleteServiceSection:
                case AuditLogActionCategory.UpdateServiceDetail:
                    return AuditLogDto.UpdateServiceAction;
                case AuditLogActionCategory.RollbackAction:
                    return AuditLogDto.RollbackAction;
                case AuditLogActionCategory.PublishAction:
                    return AuditLogDto.PublishAction;
                default: break;

            }
            return action;
        }
        public static List<string> MapActionFromDto(string action)
        {
            switch (action)
            {
                case AuditLogDto.AddServiceAction:
                    return [AuditLogActionCategory.AddService];
                case AuditLogDto.UpdateServiceAction:
                    return [
                        AuditLogActionCategory.AddServiceSection,
                        AuditLogActionCategory.UpdateServiceSection,
                        AuditLogActionCategory.DeleteServiceSection,
                        AuditLogActionCategory.UpdateServiceDetail
                        ];
                case AuditLogDto.RollbackAction:
                    return [AuditLogActionCategory.RollbackAction];
                case AuditLogDto.PublishAction:
                    return [AuditLogActionCategory.PublishAction];
                default:
                    return [];
            }
        }
        public async Task<GetAuditLogListResult> Handle(GetAuditLogReq request, CancellationToken cancellationToken)
        {
            DateTime? beginDate = null;
            if (request.Dto.BeginDate != null)
            {
                if(DateTime.TryParseExact(request.Dto.BeginDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, 
                    System.Globalization.DateTimeStyles.None, out var outputDate))
                {
                    beginDate = outputDate;
                }
            }
            DateTime? endDate = null;
            if (request.Dto.BeginDate != null)
            {
                if(DateTime.TryParseExact(request.Dto.EndDate, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var outputDate))
                {
                    endDate = outputDate;
                }
            }
            var actions = new List<string>();
            if (request.Dto.Actions != null)
            {
                foreach (var action in request.Dto.Actions)
                {
                    actions.AddRange(MapActionFromDto(action));
                }
            }
            var logs = await repo.GetEntries(
                serviceCategory: ServiceCategory.AdminPortal,
                maxCount: 200,
                pattern: string.IsNullOrWhiteSpace(request.Dto.Pattern) ? null : request.Dto.Pattern.Trim(),
                userId: string.IsNullOrWhiteSpace(request.Dto.UserId) ? null : request.Dto.UserId,
                actions: actions,
                beginDate: beginDate,
                endDate: endDate);
            var result = new List<AuditLogDto>();
            foreach (var log in logs)
            {
                var item = new AuditLogDto()
                {
                    Id = log.Id,
                    UserId = log.UserId,
                    Action = MapAction(log.Action),
                    Timestamp = log.Timestamp,
                    Description = log.Description
                };
                if (log.Details != null)
                {
                    try
                    {
                        var info = JsonSerializer.Deserialize<AdminAuditLogInfo>(log.Details);
                        if (info != null)
                        {
                            item.Status = info.Status;
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex.StackTrace);
                    }
                }
                result.Add(item);
            }
            return new GetAuditLogListResult(result);
        }
    }
}
