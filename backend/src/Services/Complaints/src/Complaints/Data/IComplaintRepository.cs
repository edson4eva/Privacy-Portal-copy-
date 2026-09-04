using Complaints.Complaints.Models;
using Libs.Data;
using Microsoft.Azure.Cosmos;

namespace Complaints.Data
{
    public interface IComplaintRepository : IBaseRepository<Complaint>
    {
        Task<IEnumerable<Complaint>> GetComplaintsByUserIdAsync(string userId);
    }

}
