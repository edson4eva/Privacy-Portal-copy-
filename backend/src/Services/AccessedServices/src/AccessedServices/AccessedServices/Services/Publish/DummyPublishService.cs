using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.Data;

namespace AccessedServices.AccessedServices.Services.Publish
{
    internal class DummyPublishService : IPublishService
    {
        public async Task ConfirmChanges(string env)
        {
            await Task.FromResult(0);
        }

        public async Task Publish(string env)
        {
            await Task.FromResult(0);
        }

        public async Task Rollback(string env)
        {
            await Task.FromResult(0);
        }
    }
}
