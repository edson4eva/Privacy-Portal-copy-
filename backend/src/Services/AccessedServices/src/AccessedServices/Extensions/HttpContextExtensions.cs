using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Extensions
{
    public static class HttpContextExtensions
    {
        public static bool IsPreviewMode(this HttpContext? httpContext)
        {
            return httpContext?.Items["IsPreviewMode"] as bool? ?? false;
        }
    }
}
