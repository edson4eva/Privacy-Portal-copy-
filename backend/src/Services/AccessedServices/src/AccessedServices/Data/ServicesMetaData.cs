using AccessedServices.AccessedServices.Models;

namespace AccessedServices.Data
{
    public static class ServicesMetadata
    {
        public static Dictionary<string, ServiceMetadata> Items { get; } = new Dictionary<string, ServiceMetadata>();
        static ServicesMetadata()
        {
            Items[ServiceId.ChildCareSubsidy] = new ServiceMetadata()
            {
                LogDescription= "This log shows when you have accessed the child care subsidy service through your Alberta.ca Account.",
                AboutService = new AboutService()
                {
                    Description = "This online service can be used to apply for subsidies to offset the cost of child care for eligible families.",
                    Hyperlink = new Hyperlink("eligible families", "https://www.alberta.ca/child-care-subsidy")
                },
                PersonalDataUsage = "The information is used to determine eligibility and subsidy rates for providing subsidized childcare to Albertans who need it.",
                PersonalInformationAttributes = [
                    "Name",
                    "Date of birth",
                    "Citizenship status",
                    "Social insurance number",
                    "Telephone number",
                    "Mailing address",
                    "Physical address",
                    "Indigenous status",
                    "Employer name",
                    "Employer phone number",
                    "Co-applicant (other parent's) information",
                    "Household income and finances",
                    "Children's information",
                    "Child care program information"
                ],
                IDPProvidedDetails = [
                    "Name",
                    "Date of birth",
                    "Mailing address"
                ],
                AuthorizedLegalAuthorities = new List<AuthorizedLegalAuthority>(){
                    new AuthorizedLegalAuthority(){
                        Name="Section 33 (c) of the Freedom of Information and Protection of Privacy Act",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=F25.cfm&leg_type=Acts&isbncln=9780779848393&display=html"
                    }
                },
                DataOwners = "Jobs, Economy and Trade",
                Keywords = "children, childcare, daycare, subsidy",
                AccessServiceUrl = "https://applychildcaresubsidy.alberta.ca/"
            };

            Items[ServiceId.DriversLicenceRenewal] = new ServiceMetadata()
            {
                LogDescription= "This log shows when you have accessed the driver’s licence renewals service through your Alberta.ca Account.",
                AboutService = new AboutService()
                {
                    Description = "This online service can be used to renew your Alberta Driver's license. Albertans are required to renew their driver's licence every 1 to 5 years, depending upon a number of factors. Driver’s licence renewals can only be performed online if the driver’s licence is not expired, and the driver’s licence is being renewed without changes. Licences can be renewed online or in-person at registries."
                },
                PersonalDataUsage = "The information is used to licence drivers and vehicles in the province and provide identification to the Government of Alberta for those who do not have a driver's licence.",
                PersonalInformationAttributes = [
                    "Name",
                    "Date of birth",
                    "Mailing address",
                    "Telephone number",
                    "Motor vehicle and traffic violations (driving record)",
                    "Vehicle registration (make, model, year)"
                ],
                IDPProvidedDetails = [
                    "Name",
                    "Date of birth",
                    "Mailing address"
                ],
                AuthorizedLegalAuthorities = new List<AuthorizedLegalAuthority>(){
                    new AuthorizedLegalAuthority(){
                        Name="Traffic Safety Act",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=t06.cfm&leg_type=Acts&isbncln=9780779847938&display=html"
                    },
                    new AuthorizedLegalAuthority(){
                        Name="Identification Card Regulation",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=2003_221.cfm&leg_type=Regs&isbncln=9780779846849&display=html"
                    },
                    new AuthorizedLegalAuthority(){
                        Name="Operator Licensing and Vehicle",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=2002_320.cfm&leg_type=Regs&isbncln=9780779849062&display=html"
                    }
                },
                DataOwners = "Service Alberta and Red Tape Reduction",
                Keywords = "driver’s licence, renewals, eServices, MOVES, government identification",
                AccessServiceUrl = "https://eservices.alberta.ca/driver-licence-renewals.html"
            };

            Items[ServiceId.PassengerVehicleRegistrationRenewal] = new ServiceMetadata()
            {
                LogDescription= "This log shows when you have accessed the renew passenger vehicle registration service through your Alberta.ca Account.",
                AboutService = new AboutService()
                {
                    Description = "This online service can be used to renew your passenger vehicle registration, which acts as proof of current registration without the need for licence plate expiry stickers, a change implemented on January 1, 2021. Eligible vehicles include Class 3 passenger cars, light trucks, vans, or motorhomes that are not registered as fleet vehicles. To renew, your address must remain unchanged, your registration cannot be expired for more than 12 months, you must have valid insurance, seek a one-year renewal, and have no outstanding fines or debts."
                },
                PersonalDataUsage = "The information is used to accurately process and verify the registration of vehicles in the province. It ensures compliance with legal requirements.",
                PersonalInformationAttributes = [
                    "Name",
                    "Date of birth",
                    "Mailing address",
                    "Telephone number",
                    "Motor vehicle and traffic violations (driving record)",
                    "Licence plate number",
                    "Vehicle registration (make, model, year)",
                    "Driver’s licence or MVID"
                ],
                IDPProvidedDetails = [
                    "Name",
                    "Date of birth",
                    "Mailing address"
                ],
                AuthorizedLegalAuthorities = new List<AuthorizedLegalAuthority>(){
                    new AuthorizedLegalAuthority(){
                        Name="Traffic Safety Act",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=t06.cfm&leg_type=Acts&isbncln=9780779847938&display=html"
                    },
                    new AuthorizedLegalAuthority(){
                        Name="Identification Card Regulation",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=2003_221.cfm&leg_type=Regs&isbncln=9780779846849&display=html"
                    },
                    new AuthorizedLegalAuthority(){
                        Name="Operator Licensing and Vehicle",
                        Url="https://kings-printer.alberta.ca/1266.cfm?page=2002_320.cfm&leg_type=Regs&isbncln=9780779849062&display=html"
                    }
                },
                DataOwners = "Service Alberta and Red Tape Reduction",
                Keywords = "passenger vehicle registration, renewals, eServices, MOVES, government identification",
                AccessServiceUrl = "https://eservices.alberta.ca/renew-passenger-vehicle-registration.html"
            };
        }
    }
}
