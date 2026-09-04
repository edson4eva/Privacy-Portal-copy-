using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using GoA.UiamRpClientLib.ServiceModels;

namespace Libs.Auth
{
    public class SignInStatus
    {
        public bool IsAuthenticated { get; set; }
        public UserClaims? Claims { get; set; }
        public UserMenu? UserMenu { get; set; }
        public bool IsVerified {  get; set; }
    }
}
