using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessedServices.Data.Publish
{
    public static class PublishUtils
    {
        public static DateTime[] GetRandomAccessDates()
        {
            var random = new Random();
            var startDate = new DateTime(2024, 10, 1);
            var endDate = DateTime.Now;

            return Enumerable.Range(0, 5)
                             .Select(_ => startDate.AddDays(random.Next((endDate - startDate).Days + 1)))
                             .ToArray();
        }
    }
}
