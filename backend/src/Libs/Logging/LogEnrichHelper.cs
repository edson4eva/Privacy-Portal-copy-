using GoA.UiamRpClientLib.Identity;
using Libs.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Serilog;
using Serilog.Context;
using System.Security.Claims;

namespace Libs.Logging
{
    public static class LogEnrichHelper
    {
        //ref: https://andrewlock.net/using-serilog-aspnetcore-in-asp-net-core-3-logging-the-selected-endpoint-name-with-serilog/
        public static void EnrichFromRequest(IDiagnosticContext diagnosticContext, HttpContext httpContext)
        {
            var request = httpContext.Request;

            // Set all the common properties available for every request
            diagnosticContext.Set("Host", request.Host);
            diagnosticContext.Set("Protocol", request.Protocol);
            diagnosticContext.Set("Scheme", request.Scheme);

            // Only set it if available. You're not sending sensitive data in a querystring right?!
            if (request.QueryString.HasValue)
            {
                diagnosticContext.Set("QueryString", request.QueryString.Value);
            }

            // Set the content-type of the Response at this point
            diagnosticContext.Set("ContentType", httpContext.Response.ContentType);

            // Retrieve the IEndpointFeature selected for the request
            var endpoint = httpContext.GetEndpoint();
            if (endpoint is object) // endpoint != null
            {
                diagnosticContext.Set("EndpointName", endpoint.DisplayName);
            }

            diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress);

            diagnosticContext.Set("AccountId", (request.HttpContext.User as User)?.AccountId);
            diagnosticContext.Set("LoginSessionId", (request.HttpContext.User as User)?.LoginSessionId);
            diagnosticContext.Set("TraceIdentifier", request.HttpContext.TraceIdentifier);
        }

        public static IApplicationBuilder UseEnrichLog(this IApplicationBuilder app)
        {
            return app.Use(async (ctx, next) =>
            {
                using (LogContext.PushProperty("CorrelationId", CorrelationExtensions.GetCorrelationId(ctx)))
                using (LogContext.PushProperty("AccountId", (ctx.User as User)?.AccountId))
                using (LogContext.PushProperty("TraceIdentifier", ctx.TraceIdentifier))
                {
                    await next();
                }
            });
        }
    }
}
