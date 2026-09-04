using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public static class Ministries
    {
        public static Dictionary<string, string> Items { get; } = [];
        static Ministries()
        {
            Items = new Dictionary<string, string>()
            {
                { "advanced-education","Advanced Education"},
                { "affordability-and-utilities","Affordability and Utilities" },
                { "agriculture-and-irrigation","Agriculture and Irrigation" },
                { "arts-culture-and-status-of-women","Arts, Culture and Status of Women" },
                { "children-and-family-services","Children and Family Services" },
                { "communications-and-public-engagement","Communications and Public Engagement" },
                { "education", "Education" },
                { "energy-and-minerals","Energy and Minerals" },
                { "environment-and-protected-areas","Environment and Protected Areas"},
                { "executive-council","Executive Council"},
                { "forestry-and-parks","Forestry and Parks" },
                { "health","Health" },
                { "immigration-and-multiculturalism","Immigration and Multiculturalism" },
                { "indigenous-relations","Indigenous Relations" },
                { "infrastructure","Infrastructure" },
                { "jobs-economy-and-trade","Jobs, Economy and Trade" },
                { "justice","Justice" },
                { "mental-health-and-addiction","Mental Health and Addiction" },
                { "primary-and-preventative-health-services", "Primary and Preventative Health Services" },
                { "hospital-and-surgical-health-services", "Hospital and Surgical Health Services" },
                { "municipal-affairs","Municipal Affairs" },
                { "public-safety-and-emergency Services","Public Safety and Emergency Services" },
                { "public-service-commission","Public Service Commission" },
                { "seniors-community-and-social-services","Seniors, Community and Social Services" },
                { "service-alberta-and-red-tape-reduction","Service Alberta and Red Tape Reduction" },
                { "technology-and-innovation","Technology and Innovation" },
                { "tourism-and-sport","Tourism and Sport" },
                { "transportation-and-economic-corridors","Transportation and Economic Corridors" },
                { "treasury-board-and-finance","Treasury Board and Finance" }
             };
        }
    }
}
