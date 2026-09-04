using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessedServices.AccessedServices.Models;
using Libs.Data;

namespace AccessedServices.Data
{
    public interface IAdminUserRepository: IBaseRepository<AdminUser>
    {
    }
}
