using Newtonsoft.Json.Linq;
using System.Web;

namespace MockData.Api
{
    public static class CollectionHelper
    {
        public static JArray GetPaginationResult(JArray list, string qs)
        {
            if (list == null || string.IsNullOrEmpty(qs))
            {
                return list ?? new JArray();
            }

            var options = PaginationOptions.ParseQueryString(qs);

            return new JArray(list
                .Skip(options.PageOffset * options.PageSize)
                .Take(options.PageSize));
        }
    }

    public class PaginationOptions
    {
        public int Total { get; set; } = 0;
        public int PageSize { get; set; } = 0;
        public int PageCount { get; set; } = 0;
        public int PageOffset { get; set; } = 0;
        public bool Randomize { get; set; } = false;
        public PaginationOptions() { }
        public static PaginationOptions ParseQueryString(string s)
        {
            var options = new PaginationOptions();
            var qs = HttpUtility.ParseQueryString(s);
            var intResult = 0;
            var boolResult = false;

            if (qs["pageSize"] != null && int.TryParse(qs["pageSize"], out intResult))
            {
                options.PageSize = intResult;
            }

            if (qs["pageOffset"] != null && int.TryParse(qs["pageOffset"], out intResult))
            {
                options.PageOffset = intResult;
            }

            if (qs["rand"] != null && bool.TryParse(qs["rand"], out boolResult))
            {
                options.Randomize = boolResult;
            }

            return options;
        }
    }
}
