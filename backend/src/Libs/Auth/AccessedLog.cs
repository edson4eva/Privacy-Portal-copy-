using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoA.UiamRpClientLib.Security
{

    public class AccessedLog
    {
        public List<object> ClaimAttributes { get; set; }
        public List<RelyingParty> RelyingParties { get; set; }
    }

    public class RelyingParty
    {
        public string Id { get; set; }
        public List<object> AccessLogs { get; set; }
    }

    public class JsendResponse<T>
    {
        public T Data { get; set; }
    }
}
