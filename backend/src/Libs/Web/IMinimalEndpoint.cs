using Microsoft.AspNetCore.Routing;

namespace Libs.Web;
public interface IMinimalEndpoint
{
    IEndpointRouteBuilder MapEndpoint(IEndpointRouteBuilder builder);
}
