using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.Data;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal interface IPublishService
    {
        Task Publish(string env);
        Task ConfirmChanges(string env);
        Task Rollback(string env);
    }
}
