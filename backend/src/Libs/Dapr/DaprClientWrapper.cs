using Dapr;
using Dapr.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Dapr
{
    public class DaprClientWrapper : IDaprClient
    {
        private readonly DaprClient _daprClient;

        public DaprClientWrapper(DaprClient daprClient)
        {
            _daprClient = daprClient;
        }

        public async Task SaveStateAsync<TValue>(string storeName, string key, TValue value, IReadOnlyDictionary<string, string>? metadata = null)
        {
            await _daprClient.SaveStateAsync(storeName,key,value,metadata:metadata);
        }

        public async Task<StateEntry<TValue>> GetStateEntryAsync<TValue>(string storeName, string key)
        {
            return await _daprClient.GetStateEntryAsync<TValue>(storeName, key);
        }
    }
}
