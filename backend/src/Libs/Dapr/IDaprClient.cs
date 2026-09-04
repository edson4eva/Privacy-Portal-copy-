using Dapr.Client;
using Dapr;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Dapr
{
    public interface IDaprClient
    {
        Task<StateEntry<TValue>> GetStateEntryAsync<TValue>(string storeName, string key);
        Task SaveStateAsync<TValue>(string storeName, string key, TValue value, IReadOnlyDictionary<string, string>? metadata = default);
    }
}