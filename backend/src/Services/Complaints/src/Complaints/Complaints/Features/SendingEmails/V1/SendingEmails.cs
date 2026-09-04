using Complaints.Complaints.Models;
using Libs.Notification;
using Libs.Web;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;

namespace Complaints.Complaints.Features.SendingEmails.V1
{
    public record SendEmailRequest(Personalisation Personalisation) : IRequest<SendEmailResult>;

    public record SendEmailResult(bool Success, string Message);

    public record SendEmailResponseDto(bool Success, string Message);

    public class SendEmailFeature : IMinimalEndpoint
    {
        public IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder)
        {
            builder.MapPost($"{EndpointConfig.BaseApiPath}/send-email",
                async (IMediator mediator, SendEmailRequest request, CancellationToken cancellationToken) =>
                {
                    var result = await mediator.Send(request, cancellationToken);

                    var response = result.Adapt<SendEmailResponseDto>();

                    return Results.Ok(response);
                })
                .WithName("SendEmail")
                .WithApiVersionSet(builder.NewApiVersionSet("Email").Build())
                .Produces<SendEmailResponseDto>()
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithSummary("Send an email using AB Notify.")
                .WithDescription("Send an email using AB Notify with specified template")
                .WithOpenApi()
                .HasApiVersion(1.0);

            return builder;
        }
    }

    internal class SendEmailHandler : IRequestHandler<SendEmailRequest, SendEmailResult>
    {
        private readonly INotificationService _notificationService;
        private readonly IConfiguration _configuration;

        public SendEmailHandler(INotificationService notificationService, IConfiguration configuration)
        {
            _notificationService = notificationService;
            _configuration = configuration;
        }

        public async Task<SendEmailResult> Handle(SendEmailRequest request, CancellationToken cancellationToken)
        {
            try
            {   
                string? confirmationEmailToAlbertanTemplateGuid = _configuration["AbNotify:ConfirmationEmailToAlbertanTemplateGuid"];
                string? privacyServiceAdvisorEmailTemplateGuid = _configuration["AbNotify:PrivacyServiceAdvisorEmailTemplateGuid"];
                string? privacyServiceAdvisorEmailTo = _configuration["AbNotify:PrivacyServiceAdvisorEmailAddress"];
                
                //send new complaint email
                var success = await _notificationService.Send(privacyServiceAdvisorEmailTemplateGuid, privacyServiceAdvisorEmailTo, request.Personalisation);
                if (!success)
                {
                    return new SendEmailResult(false, "Failed to send email for newly filed complaint.");
                }

                var acknowledgmentPersonalization = new Personalisation { Department = request.Personalisation.Department }; 
                // Send acknowledgment email
                var acknowledgmentSuccess = await _notificationService.Send(confirmationEmailToAlbertanTemplateGuid, request.Personalisation.UserEmail, acknowledgmentPersonalization); 
                if (!acknowledgmentSuccess) 
                { 
                    return new SendEmailResult(false, "Failed to send the acknowledgment email.");
                }

                return new SendEmailResult(true, "Both email are sent successfully");
            }
            catch (Exception)
            {

                throw;
            }
        } 
    }
}
