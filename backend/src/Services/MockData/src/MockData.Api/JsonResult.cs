using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;
using Libs.Web;

namespace MockData.Api
{
    public class JsonResult : JsonResult<object>
    {
        public JsonResult(object value) : base(value, HttpStatusCode.OK)
        {
        }
        public JsonResult(object value, HttpStatusCode status) : base(value, status)
        {
        }
        public JsonResult(object value, HttpStatusCode status, object meta) : base(value, status, meta)
        {
        }
    }

    public class JsonResult<T> : ContentResult where T : new()
    {
        public JsonResult(T value) : this(value, HttpStatusCode.OK) { }
        public JsonResult(T value, HttpStatusCode status) : this(value, status, null) { }
        public JsonResult(T value, HttpStatusCode status, dynamic meta) : base()
        {
            this.ContentType = "application/json";
            this.StatusCode = (int)status;

            if (value is JToken jTokenValue)
            {
                this.Content = jTokenValue.ToString(Formatting.Indented, new DynamicDataConverter());
            }
            else
            {
                this.Content = value.Serialize();
            }
        }
    }
}
