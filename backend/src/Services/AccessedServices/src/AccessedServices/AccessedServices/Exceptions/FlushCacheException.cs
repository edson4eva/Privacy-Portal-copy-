using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Libs.Exception;

namespace AccessedServices.AccessedServices.Exceptions
{
    public class FlushCacheException: CustomException
    {
        public FlushCacheException(string host, string error) : base($"Flush Redis Cache Failed: {host}, {error}")
        {
        }
    }
}
