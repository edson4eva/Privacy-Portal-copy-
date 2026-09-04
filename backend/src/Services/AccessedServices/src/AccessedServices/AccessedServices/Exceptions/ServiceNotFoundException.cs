using Libs.Exception;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Exceptions
{
    public class ServiceNotFoundException : NotFoundException
    {
        public ServiceNotFoundException() : base("Service not found!")
        {
        }
    }
}
