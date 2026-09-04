using Libs.Notification;

namespace Complaints.Complaints.Models
{
    public class Personalisation : IPersonalisation
    {
        public string Department { get; set; }

        public string ServiceName { get; set; }

        public string PrivacyConcern { get; set; }

        public string Circumstances { get; set; }

        public string EmployeeName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string UserEmail { get; set; }

        public string DocumentLinks { get; set; }

        public string DocumentDescription { get; set; }

        public string DateOfSubmission { get; set; } = "";

        public string TimeOfSubmission { get; set; } = "";

        public string AccountType { get; set; } = "guest";

        public Dictionary<string, dynamic> GetDictionary() 
        { 
            var dict = new Dictionary<string, dynamic>(); 
            if (FirstName != null) dict["First Name"] = FirstName; 
            if (LastName != null) dict["Last Name"] = LastName; 
            if (DateOfSubmission != null) dict["Date of Submission"] = DateOfSubmission; 
            if (TimeOfSubmission != null) dict["Time of Submission"] = TimeOfSubmission; 
            if (UserEmail != null) dict["User's Email"] = UserEmail; 
            if (AccountType != null) dict["Verified account OR basic account OR guest user"] = AccountType; 
            if (Department != null) dict["Department"] = Department; 
            if (ServiceName != null) dict["Service Name"] = ServiceName;
            if (PrivacyConcern != null) dict["Type of privacy concern"] = PrivacyConcern;
            if (Circumstances != null) dict["Describe circumstances"] = Circumstances; 
            if (EmployeeName != null) dict["Employee Name"] = EmployeeName; 
            if (DocumentLinks != null) dict["URL"] = DocumentLinks; 
            if (DocumentDescription != null) dict["Document Description"] = DocumentDescription; 
            
            return dict; 
        }
    }
}
