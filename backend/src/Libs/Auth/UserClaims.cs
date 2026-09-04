using GoA.UiamRpClientLib.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Auth
{
    public class UserClaims
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string IdentityLoa { get; set; }
        public string CredentialLoa { get; set; }
        public string ProfileType { get; set; }
        public string BusinessName { get; set; }
        public string Role { get; set; }
    }

    public static class ClaimsPrincipalExtensions
    {
        public static UserClaims ToUserClaims(this ClaimsPrincipal user)
        {
            return new UserClaims
            {
                Email = user.FindFirst(ClaimTypes.Email)?.Value,
                FirstName = user.FindFirst(ClaimTypes.GivenName)?.Value,
                LastName = user.FindFirst(ClaimTypes.Surname)?.Value,
                IdentityLoa = user.FindFirst(CustomClaimTypes.IdentityLOA)?.Value,
                CredentialLoa = user.FindFirst(CustomClaimTypes.CredentialsLoA)?.Value,
                ProfileType = user.FindFirst(CustomClaimTypes.ProfileType)?.Value,
                BusinessName = user.FindFirst("http://cyber-auth.gc.ca/business/name")?.Value,
                Role = user.FindFirst("http://cyber-auth.gc.ca/business/user/role")?.Value
            };
        }

        public static bool IsVerified(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(CustomClaimTypes.VerificationStatus) == CustomClaimTypes.VerificationStatus + "/verified" ? true : false;
        }
    }
}
