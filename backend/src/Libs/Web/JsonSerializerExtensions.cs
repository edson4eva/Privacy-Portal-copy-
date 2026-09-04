using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;

namespace Libs.Web
{
    public static class JsonSerializerExtensions
    {
        private static JsonSerializerSettings defaultSerializerSettings =
            new JsonSerializerSettings()
            {
                Formatting = Formatting.Indented,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

        private static JsonLoadSettings defaultJsonLoadSettings =
            new JsonLoadSettings() { };

        public static T Deserialize<T>(this string json)
        {
            return Deserialize<T>(json, defaultSerializerSettings);
        }

        public static T Deserialize<T>(this string json, JsonSerializerSettings settings)
        {
            return JsonConvert.DeserializeObject<T>(json, settings);
        }

        public static JToken Parse(this string json)
        {
            return Parse(json, defaultJsonLoadSettings);
        }

        public static JToken Parse(this string json, JsonLoadSettings settings)
        {
            return JObject.Parse(json, settings);
        }

        public static string Serialize<T>(this T obj)
        {
            return JsonConvert.SerializeObject(obj, defaultSerializerSettings);
        }

        public static string Serialize<T>(this T obj, JsonSerializerSettings settings)
        {
            return JsonConvert.SerializeObject(obj, settings);
        }

        public static void UpdateSerializerSettings(JsonSerializerSettings settings)
        {
            defaultSerializerSettings = settings;
        }

        public static void UpdateJsonLoadSettings(JsonLoadSettings settings)
        {
            defaultJsonLoadSettings = settings;
        }
    }
}
