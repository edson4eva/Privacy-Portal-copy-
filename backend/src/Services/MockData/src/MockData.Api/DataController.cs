using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Libs.Web;

namespace MockData.Api
{
    [ApiController()]
    [Route("[controller]")]
    public class DataController : ControllerBase
    {
        [HttpGet("")]
        public IActionResult Get()
        {
            return new OkObjectResult(new { Message = "Hello, World!" });
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
                using (var r = new StreamReader("data.json"))
                {
                    string json = r.ReadToEnd();
                    var token = json.Parse();
                    var path = string.Join(".", catchAll.Split("/").Where(s => !string.IsNullOrEmpty(s)));
                    var result = token.SelectToken(path);

                    if (result == null)
                    {
                        return NotFound("Path could not be found");
                    }

                    if (result is JArray jArray)
                    {
                        return new JsonResult( CollectionHelper.GetPaginationResult(jArray, qs));
                    }

                    return new JsonResult(result);
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
