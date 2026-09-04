using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.Data
{
    public static class DefaultServiceData
    {
        public static List<ServiceDataSection> CreateDefaultAccordions()
        {
            return [
                new ServiceDataSection(){
                        Title = "Personal information",
                        Content = "Please enter content here."
                    },
                    new ServiceDataSection(){
                        Title = "How personal information is used",
                        Content = "Please enter content here."
                    },
                    new ServiceDataSection(){
                        Title = "Legislation",
                        Content = "Please enter content here."
                    }
                ];
        }
    }
}
