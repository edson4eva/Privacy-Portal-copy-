using Refit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Features.EServicesDataApi.V1
{
    public interface IEServicesDataApi
    {
        [Post("/privacy-portal")]
        Task<HttpResponseMessage> GetUserHistory(GetUserHistoryRequest request, [HeaderCollection] IDictionary<string, string> headers);
        

        [Post("/integration/admin/token")]
        Task<HttpResponseMessage> GetAuthorizationToken(GetTokenRequest request);
    }

    public record GetUserHistoryRequest(string email, string requestId, string requestDateTime, int accessLogLimit = 5);
    public record GetTokenRequest(string username, string password);

    public class GetUserHistoryApiResponse
    {
        public string UserId { get; set; }
        public string RequestId { get; set; }
        public DateTime RequestDateTime { get; set; }
        public DateTime ResponseDateTime { get; set; }
        public bool IsUserValid { get; set; }
        public IList<Product> Products { get; set; } = new List<Product>();
    }

    public class Product
    {
        public string Name { get; set; }
        public string Sku { get; set; }
        public string AccessLogs { get; set; }
    }
}
