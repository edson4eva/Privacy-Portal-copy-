using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Libs.Utils
{
    public static class EnvironmentFeatureExtensions
    {
        public static bool ShouldEnableSwagger(this IHostEnvironment env)
        {
            return env.IsDevelopment() || env.IsEnvironment("dev") || env.IsEnvironment("sit") || env.IsEnvironment("uat");
        }
    }
}
