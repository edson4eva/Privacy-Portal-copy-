using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Libs.Web;

namespace MockData.Api
{
    [ApiController()]
    [Route("[controller]")]
    public class EServicesController : ControllerBase
    {
        [HttpGet("")]
        public IActionResult Get()
        {
            return new OkObjectResult(new { Message = "Welcome to the eServices mock data controller " });
        }

        [HttpGet("{**catchAll}")]
        public IActionResult GetCatchAll(string catchAll)
        {
            return PostCatchAll(catchAll, new PostCatchAllRequest());
        }

        [HttpPost("{**catchAll}")]
        public IActionResult PostCatchAll(string catchAll, [FromBody] PostCatchAllRequest request)
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
                using (var r = new StreamReader("eservices.json"))
                {
                    string json = r.ReadToEnd();
                    var token = json.Parse();
                    var path = string.Join(".", ["get-user-history", request.UserId]);
                    var result = token.SelectToken(path);

                    if (result == null)
                    {
                        return new JsonResult(new PostCatchAllResponse(request, Enumerable.Empty<string>()) { IsUserValid = false });
                    }

                    if (result is JArray jArray)
                    {
                        return new JsonResult(new PostCatchAllResponse(request, CollectionHelper.GetPaginationResult(jArray, qs)));
                    }

                    return new JsonResult(new PostCatchAllResponse(request, result));
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

        public class PostCatchAllRequest
        {
            public string UserId { get; set; } = Guid.NewGuid().ToString();
            public string RequestId { get; set; } = Guid.NewGuid().ToString();
            public int AccessLogLimit { get; set; } = 5;
            public DateTime RequestDateTime { get; set; } = DateTime.UtcNow;
        }

        public class PostCatchAllResponse
        {
            public string UserId { get; set; } = Guid.NewGuid().ToString();
            public string ResponseToRequestId { get; set; } = Guid.NewGuid().ToString();
            public DateTime RequestDateTime { get; set; } = DateTime.UtcNow;
            public DateTime ResponseDateTime { get; set; } = DateTime.UtcNow;
            public bool IsUserValid { get; set; } = true;
            public object Products { get; set; } = null;

            public PostCatchAllResponse()
            {
            }
            public PostCatchAllResponse(PostCatchAllRequest request, object products) : this()
            {
                this.Products = products;

                this.UserId = request.UserId;
                this.ResponseToRequestId = request.RequestId;
                this.RequestDateTime = request.RequestDateTime;
                this.ResponseDateTime = DateTime.UtcNow;
            }
        }
    }
}
