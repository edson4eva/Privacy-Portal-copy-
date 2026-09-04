using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace Libs.Web
{
    public static class CorrelationExtensions
    {
        private const string CorrelationId = "X-Correlation-Id";

        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        {
            return app.Use(async (ctx, next) =>
            {
                if (!ctx.Request.Headers.TryGetValue(CorrelationId, out var correlationId))
                    correlationId = Guid.NewGuid().ToString("N");

                ctx.Items[CorrelationId] = correlationId.ToString();
                ctx.Response.OnStarting(() =>
                {
                    // Add CorrelationId to the response headers for tracking on client-side
                    ctx.Response.Headers[CorrelationId] = correlationId;
                    return Task.CompletedTask;
                });
                await next();
            });
        }

        public static string GetCorrelationId(this HttpContext context)
        {
            context.Items.TryGetValue(CorrelationId, out var correlationId);
            return string.IsNullOrWhiteSpace(correlationId?.ToString()) ? Guid.NewGuid().ToString("N") : correlationId?.ToString()??"";
        }
    }
}
