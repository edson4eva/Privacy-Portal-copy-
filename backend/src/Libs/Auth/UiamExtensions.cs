using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Net;

namespace Libs.Auth
{
    public static class UiamExtensions
    {
        public static void RemoveCookieWithPrefix(this HttpContext httpContext, string prefix = "WebGuard.AppAuth")
        {
            // Get all cookies from the request
            var cookies = httpContext.Request.Cookies;

            foreach (var webGuardCookie in cookies)
            {
                // Check if the cookie's name starts with the provided prefix
                if (webGuardCookie.Key.StartsWith(prefix))
                {
                    // Create a new cookie with the same name and set its expiration to a past date to delete it
                    var expiredCookie = new Cookie(webGuardCookie.Key, webGuardCookie.Value)
                    {
                        Expires = DateTime.Now.AddDays(-1),
                        Path = "/" // Make sure the path matches the cookie's original path
                    };

                    // Add the expired cookie to the response to remove it from the client's browser
                    httpContext.Response.Cookies.Append(webGuardCookie.Key, expiredCookie.Value, new CookieOptions
                    {
                        Expires = expiredCookie.Expires,
                        Path = expiredCookie.Path
                    });
                }
            }
        }
    }
}
