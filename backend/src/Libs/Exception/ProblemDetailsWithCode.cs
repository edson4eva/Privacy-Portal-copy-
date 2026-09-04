using System.Text.Json.Serialization;

namespace Libs.Exception;

using ProblemDetails = Microsoft.AspNetCore.Mvc.ProblemDetails;

public class ProblemDetailsWithCode : ProblemDetails
{
    [JsonPropertyName("code")]
    public int? Code { get; set; }
}
