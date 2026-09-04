using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public class Hyperlink
    {
        public string Text { get; set; }
        public string Url { get; set; }

        public Hyperlink(string text, string url)
        {
            Text = text;
            Url = url;
        }
    }
    public class AboutService
    {
        public required string Description { get; set; }
        public Hyperlink? Hyperlink { get; set; }
    }
    public class AuthorizedLegalAuthority
    {
        public required string Name { get; set; }
        public string? Url { get; set; }
    }
    public class ServiceMetadata
    {
        public required string LogDescription { get; set; }
        public required AboutService AboutService { get; set; }
        public required string PersonalDataUsage { get; set; }
        public required List<string> PersonalInformationAttributes { get; set; }
        public required List<string> IDPProvidedDetails { get; set; }//TODO: may need to populate from UIAM/eService
        public List<AuthorizedLegalAuthority>? AuthorizedLegalAuthorities { get; set; }
        public string? DataOwners { get; set; }
        public string? Keywords { get; set; }
        public required string AccessServiceUrl {  get; set; }
    }
}
