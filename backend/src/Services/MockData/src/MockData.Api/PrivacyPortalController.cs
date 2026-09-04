using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace MockData.Api
{
    [ApiController()]
    [Route("privacy-portal")]
    public class PrivacyPortalController : ControllerBase
    {
        [HttpGet("")]
        public IActionResult Get()
        {
            return PostCatchAll(string.Empty);
        }

        [HttpPost("")]
        public IActionResult Post()
        {
            return PostCatchAll(string.Empty);
        }

        [HttpGet("{**catchAll}")]
        public IActionResult GetCatchAll(string catchAll)
        {
            return PostCatchAll(catchAll);
        }

        [HttpPost("{**catchAll}")]
        public IActionResult PostCatchAll(string catchAll)
        {
            var qs = Request.QueryString.Value;

            if (qs.Contains("debug"))
            {
                return new OkObjectResult(
                    new
                    {
                        route = Request.GetEncodedUrl(),
                        @params = qs,
                        headers = Request.Headers,
                        contentType = Request.ContentType,
                    }
                );
            }

            try
            {
                // read the data.json file into json object
                using (var r = new StreamReader("privacy-portal.json"))
                {
                    string json = r.ReadToEnd();

                    return new ContentResult() { Content = json, ContentType = "application/json", StatusCode = 200 };
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    errorType = ex.GetType().FullName,
                    errorMessage = ex.Message,
                    innerExceptionType = ex.InnerException?.GetType().FullName,
                    innerExceptionMessage = ex.InnerException?.Message
                });
            }
        }
    }
}
