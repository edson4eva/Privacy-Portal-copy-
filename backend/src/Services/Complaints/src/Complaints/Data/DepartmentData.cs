using Complaints.Complaints.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.Data
{
    public static class DepartmentData
    {
        public static readonly List<Department> Departments = new List<Department>
        {
            new Department { Code = DepartmentCodes.AdvancedEducation, DisplayName = "Advanced Education" },
            new Department { Code = DepartmentCodes.AffordabilityAndUtilities, DisplayName = "Affordability and Utilities" },
            new Department { Code = DepartmentCodes.AgricultureAndIrrigation, DisplayName = "Agriculture and Irrigation" },
            new Department { Code = DepartmentCodes.ArtsCultureAndStatusOfWomen, DisplayName = "Arts, Culture and Status of Women" },
            new Department { Code = DepartmentCodes.ChildrenAndFamilyServices, DisplayName = "Children and Family Services" },
            new Department { Code = DepartmentCodes.CommunicationsAndPublicEngagement, DisplayName = "Communications and Public Engagement" },
            new Department { Code = DepartmentCodes.Education, DisplayName = "Education" },
            new Department { Code = DepartmentCodes.EnergyAndMinerals, DisplayName = "Energy and Minerals" },
            new Department { Code = DepartmentCodes.EnvironmentAndProtectedAreas, DisplayName = "Environment and Protected Areas" },
            new Department { Code = DepartmentCodes.ExecutiveCouncil, DisplayName = "Executive Council" },
            new Department { Code = DepartmentCodes.ForestryAndParks, DisplayName = "Forestry and Parks" },
            new Department { Code = DepartmentCodes.Health, DisplayName = "Health" },
            new Department { Code = DepartmentCodes.ImmigrationAndMulticulturalism, DisplayName = "Immigration and Multiculturalism" },
            new Department { Code = DepartmentCodes.IndigenousRelations, DisplayName = "Indigenous Relations" },
            new Department { Code = DepartmentCodes.Infrastructure, DisplayName = "Infrastructure" },
            new Department { Code = DepartmentCodes.JobsEconomyAndTrade, DisplayName = "Jobs Economy and Trade" },
            new Department { Code = DepartmentCodes.Justice, DisplayName = "Justice" },
            new Department { Code = DepartmentCodes.MentalHealthAndAddiction, DisplayName = "Mental Health and Addiction" },
            new Department { Code = DepartmentCodes.MunicipalAffairs, DisplayName = "Municipal Affairs" },
            new Department { Code = DepartmentCodes.PublicSafetyAndEmergencyServices, DisplayName = "Public Safety and Emergency Services" },
            new Department { Code = DepartmentCodes.PublicServiceCommission, DisplayName = "Public Service Commission" },
            new Department { Code = DepartmentCodes.SeniorsCommunityAndSocialServices, DisplayName = "Seniors Community and Social Services" },
            new Department { Code = DepartmentCodes.ServiceAlbertaAndRedTapeReduction, DisplayName = "Service Alberta and Red Tape Reduction" },
            new Department { Code = DepartmentCodes.TechnologyAndInnovation, DisplayName = "Technology and Innovation" },
            new Department { Code = DepartmentCodes.TourismAndSport, DisplayName = "Tourism and Sport" },
            new Department { Code = DepartmentCodes.TransportationAndEconomicCorridors, DisplayName = "Transportation and Economic Corridors" },
            new Department { Code = DepartmentCodes.TreasuryBoardAndFinance, DisplayName = "Treasury Board and Finance" },
        };
    }

}
