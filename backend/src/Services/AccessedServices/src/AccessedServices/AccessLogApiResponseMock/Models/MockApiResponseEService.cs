using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.AccessLogApiResponseMock.Models
{
    public class MockApiResponseEService
    {
        public required string Id { get; set; }
        public DateTime[]? AccessedDates { get; set; }
    }
}
