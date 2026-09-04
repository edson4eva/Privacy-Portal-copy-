using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessedServices.Models
{
    public static class Categories
    {
        public static Dictionary<string, string> Items { get; } = [];
        static Categories()
        {
            Items = new Dictionary<string, string>()
            {
                { "family-and-social-support", "Family and Social Support" },
                { "driving-and-vehicles", "Driving and Vehicles" },
                { "education", "Education" },
                { "employment", "Employment" },
                { "health", "Health" },
                { "life-events", "Life Events" },
                { "justice", "Justice" },
                { "emergency-services", "Emergency Services" },
                { "moving-to-alberta", "Moving to Alberta" },
                { "permits-Records-government-services", "Permits, Records & Government Services" }
            };
        }
    }
}
