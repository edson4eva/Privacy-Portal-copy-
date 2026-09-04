using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Libs.Web;

public interface ICurrentUserProvider
{
    CurrentUser? GetCurrentUser();
}

public class CurrentUser
{
    public required string Name { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }

}

public class CurrentUserProvider : ICurrentUserProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }


    public CurrentUser? GetCurrentUser()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        var email = user?.FindFirst(ClaimTypes.Email)?.Value;
        var claims = (user?.Identity as ClaimsIdentity)?.Claims;        

        if (user == null || claims==null || email==null) return null;
        
        string name = claims.First(_ => _.Type == "name").Value;
        var username = claims.First(_ => _.Type == "preferred_username").Value;        

        var currentUser = new CurrentUser() { Email=email, UserName=username, Name=name};

        return currentUser;
    }
}