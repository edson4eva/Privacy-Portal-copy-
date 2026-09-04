using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Identity.Client;

namespace AccessedServices.Data
{
    public class EServiceOptions
    {
        public required string ApiEndpoint { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
    }
    public class AccessedServicesOptions
    {
        public bool UseMock {  get; set; }
        public string? MockDataSource {  get; set; }//CODE or DB
        public EServiceOptions? EServiceOptions {  get; set; }

    }
}
