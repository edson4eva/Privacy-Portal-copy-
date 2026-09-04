using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;

namespace AccessedServices.Data
{
    public class InitialServiceData
    {
        private const int CURRENT_VERSION = 3;
        public static Dictionary<string, Service> Items { get; } = [];
        static InitialServiceData()
        {
            Items[ServiceId.ChildCareSubsidy] = new Service()
            {
                Version = CURRENT_VERSION,
                Id = ServiceId.ChildCareSubsidy,
                ServiceName = "Child Care Subsidy",
                CategoryId = "family-and-social-support",
                IsAvailable = true,
                Origin = Origin.UIAM,
                RPId = null,
                Sku = null,
                ShowOnUI = true,
                Description = "This online service can be used to apply for subsidies to offset the cost of child care for <a href=\"https://www.alberta.ca/child-care-subsidy\" target=\"_blank\">eligible families</a>.",
                DataOwnerId = "jobs-economy-and-trade",
                AccessServiceUrl = "https://applychildcaresubsidy.alberta.ca/",
                ShowMockInDev = true,
                Sections =
                [
                    new ServiceDataSection()
                    {
                        Title = "Personal information",
                        Content = "<div>Personal information the service may maintain for you includes:</div>"+
                        "<ul>" +
                        "<li>Name</li>" +
                        "<li>Date of birth</li>" +
                        "<li>Citizenship status</li>" +
                        "<li>Social insurance number</li>" +
                        "<li>Telephone number</li>" +
                        "<li>Mailing address</li>" +
                        "<li>Physical address</li>" +
                        "<li>Indigenous status</li>" +
                        "<li>Employer name</li>" +
                        "<li>Employer phone number</li>" +
                        "<li>Co-applicant (other parent's) information</li>" +
                        "<li>Household income and finances</li>" +
                        "<li>Children's information</li>" +
                        "<li>Child care program information</li>" +
                        "</ul>"
                    },
                    new ServiceDataSection()
                    {
                        Title = "How is personal data being used",
                        Content = "The information is used to determine eligibility and subsidy rates for providing subsidized childcare to Albertans who need it."
                    },
                    new ServiceDataSection()
                    {
                        Title = "Legislation",
                        Content = "<div>The following are the legal authorities that authorize this service to collect your personal information:</div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=F25.cfm&leg_type=Acts&isbncln=9780779848393&display=html\" target=\"_blank\">Section 33 (c) of the Freedom of Information and Protection of Privacy Act</a></div>"
                    }
                ]
            };
            Items[ServiceId.DriversLicenceRenewal] = new Service()
            {
                Version = CURRENT_VERSION,
                Id = ServiceId.DriversLicenceRenewal,
                ServiceName = "Driver’s licence renewal",
                CategoryId = "driving-and-vehicles",
                IsAvailable = true,
                Origin = Origin.EServices,
                RPId = null,
                Sku = "AB-RSG-DL-Renewals",
                ShowOnUI = true,
                Description = "This online service can be used to renew your Alberta Driver's license. " +
                        "Albertans are required to renew their driver's licence every 1 to 5 years, depending upon a number of factors. " +
                        "Driver’s licence renewals can only be performed online if the driver’s licence is not expired, " +
                        "and the driver’s licence is being renewed without changes. Licences can be renewed online or in-person at registries.",
                DataOwnerId = "service-alberta-and-red-tape-reduction",
                AccessServiceUrl = "https://eservices.alberta.ca/driver-licence-renewals.html",
                ShowMockInDev = true,
                Sections = [
                    new ServiceDataSection()
                    {
                        Title = "Personal information",
                        Content = "<div>Personal information the service may maintain for you includes:</div>"+
                        "<ul>" +
                        "<li>Name</li>" +
                        "<li>Date of birth</li>" +
                        "<li>Mailing address</li>" +
                        "<li>Telephone number</li>" +
                        "<li>Motor vehicle and traffic violations (driving record)</li>"+
                        "<li>Vehicle registration (make, model, year)</li>"+
                        "</ul>"
                    },
                    new ServiceDataSection()
                    {
                        Title = "How is personal data being used",
                        Content = "The information is used to licence drivers and vehicles in the province and provide identification to the Government of Alberta for those who do not have a driver's licence."
                    },
                    new ServiceDataSection()
                    {
                        Title = "Legislation",
                        Content = "<div>The following are the legal authorities that authorize this service to collect your personal information:</div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=t06.cfm&leg_type=Acts&isbncln=9780779847938&display=html\" target=\"_blank\">" +
                        "Traffic Safety Act</a></div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=2003_221.cfm&leg_type=Regs&isbncln=9780779846849&display=html\" target=\"_blank\">" +
                        "Identification Card Regulation</a></div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=2002_320.cfm&leg_type=Regs&isbncln=9780779849062&display=html\" target=\"_blank\">" +
                        "Operator Licensing and Vehicle</a></div>"
                    }
                ]
            };
            Items[ServiceId.PassengerVehicleRegistrationRenewal] = new Service()
            {
                Version = CURRENT_VERSION,
                Id = ServiceId.PassengerVehicleRegistrationRenewal,
                ServiceName = "Passenger vehicle registration renewal",
                CategoryId = "driving-and-vehicles",
                IsAvailable = true,
                Origin = Origin.EServices,
                RPId = null,
                Sku = "AB-RSG-OTP-OVR-Renew-Vehicle",
                ShowOnUI = true,
                Description = "This online service can be used to renew your passenger vehicle registration, " +
                        "which acts as proof of current registration without the need for licence plate expiry stickers, a change implemented on January 1, 2021. " +
                        "Eligible vehicles include Class 3 passenger cars, light trucks, vans, or motorhomes that are not registered as fleet vehicles. " +
                        "To renew, your address must remain unchanged, your registration cannot be expired for more than 12 months, you must have valid insurance, " +
                        "seek a one-year renewal, and have no outstanding fines or debts.",
                DataOwnerId = "service-alberta-and-red-tape-reduction",
                AccessServiceUrl = "https://eservices.alberta.ca/renew-passenger-vehicle-registration.html",
                ShowMockInDev = true,
                Sections = [
                    new ServiceDataSection()
                    {
                        Title = "Personal information",
                        Content = "<div>Personal information the service may maintain for you includes:</div>"+
                        "<ul>" +
                        "<li>Name</li>" +
                        "<li>Date of birth</li>" +
                        "<li>Mailing address</li>" +
                        "<li>Telephone number</li>" +
                        "<li>Motor vehicle and traffic violations (driving record)</li>"+
                        "<li>Licence plate number</li>"+
                        "<li>Vehicle registration (make, model, year)</li>"+
                        "<li>Driver’s licence or MVID</li>"+
                        "</ul>"
                    },
                    new ServiceDataSection()
                    {
                        Title = "How is personal data being used",
                        Content = "The information is used to accurately process and verify the registration of vehicles in the province. It ensures compliance with legal requirements."
                    },
                    new ServiceDataSection()
                    {
                        Title = "Legislation",
                        Content = "<div>The following are the legal authorities that authorize this service to collect your personal information:</div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=t06.cfm&leg_type=Acts&isbncln=9780779847938&display=html\" target=\"_blank\">" +
                        "Traffic Safety Act</a></div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=2003_221.cfm&leg_type=Regs&isbncln=9780779846849&display=html\" target=\"_blank\">" +
                        "Identification Card Regulation</a></div>"+
                        "<div><a href=\"https://kings-printer.alberta.ca/1266.cfm?page=2002_320.cfm&leg_type=Regs&isbncln=9780779849062&display=html\" target=\"_blank\">" +
                        "Operator Licensing and Vehicle</a></div>"
                    }
                ]
            };
            Items[ServiceId.FinePayments] = new Service()
            {
                Version = CURRENT_VERSION,
                Id = ServiceId.FinePayments,
                ServiceName = "Fine payments",
                CategoryId = "justice",
                IsAvailable = false,
                Origin = Origin.EServices,
                RPId = null,
                Sku = "AB-Justice-Fine-Payments",
                ShowOnUI = true,
                Description = "",
                DataOwnerId = "",
                AccessServiceUrl = "",
                ShowMockInDev = true,
                Sections = []
            };
            Items[ServiceId.EServices] = new Service()
            {
                Version = CURRENT_VERSION,
                Id = ServiceId.EServices,
                ServiceName = "eServices",
                CategoryId = "",
                IsAvailable = true,
                Origin = Origin.UIAM,
                RPId = null,
                Sku = null,
                ShowOnUI = false,
                Description = "",
                DataOwnerId = "",
                AccessServiceUrl = "",
                ShowMockInDev = true,
                Sections = []
            };
        }
    }
}