using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;
using System.Reflection.PortableExecutable;

namespace MockData.Api
{
    public class DynamicDataConverter : JsonConverter
    {

        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(string);
        }

        public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            string s = (string)reader.Value;
            var matches = Regex.Match(s, "{{(.)}}");

            if (matches != null && matches.Success)
            {
                try
                {
                    return RoslynScripting(matches.Value);
                }
                catch (Exception)
                {
                    // didn't work so return as is
                }
            }

            return s;
        }

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            string s = value?.ToString();
            var matches = Regex.Match(s, "{{(.*)}}");

            if (matches != null && matches.Success)
            {
                try
                {
                    s = RoslynScripting(matches.Groups[1].Value);
                }
                catch (Exception)
                {
                    // didn't work so return as is
                }
            }

            writer.WriteValue(s);
        }

        public static string RoslynScripting(string code)
        {
            string methodCode = $@"string result = $""{{{code}}}"";";
            var opt = ScriptOptions.Default
                .AddReferences(typeof(string).Assembly, typeof(DateTime).Assembly, typeof(ParmModel).Assembly)
                .AddImports("System");

            var state = CSharpScript.RunAsync(methodCode, opt).Result;
            string result = state.Variables.FirstOrDefault(v => v.Name == "result")?.Value as string;

            return result;
        }

        public class ParmModel
        {
            public string Code { get; set; }
        }
    }
}
