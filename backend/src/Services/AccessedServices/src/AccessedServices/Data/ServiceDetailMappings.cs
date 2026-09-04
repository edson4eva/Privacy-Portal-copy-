using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Dtos;
using AccessedServices.AccessedServices.Models;
using Mapster;

namespace AccessedServices.Data
{
    public class ServiceDetailMappings : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<ServiceDetailDto, DraftService>().IgnoreNullValues(true);
        }
    }
}
