using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data.Publish
{
    public interface IRedisClient
    {
        Task FlushCache();
    }
}
