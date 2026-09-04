using AccessedServices.AccessedServices.Models;
using Libs.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data
{
    public interface IServiceRepository : IBaseRepository<Service>
    {
    }
}
