using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Libs.Exception;

namespace AccessedServices.AccessedServices.Exceptions
{
    public class InvalidIArrayIndexException: CustomException
    {
        public InvalidIArrayIndexException() : base("Invalid Array Index!")
        {
        }
    }
}
