using Libs.Web;
using Microsoft.AspNetCore.Http;
using System.Text.RegularExpressions;

namespace AccessedServices.Middlewares
{
    public class PreviewModeMiddleware
    {
        private readonly RequestDelegate _next;

        public PreviewModeMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            string path = context.Request.Path.ToString();
            
            bool isPreview = Regex.IsMatch(path, @$"/{EndpointConfig.BaseApiPath.Replace("{version:apiVersion}", @"\d+")}/preview/accessed-services");           

            context.Items["IsPreviewMode"] = isPreview;

            await _next(context);
        }
    }
}
