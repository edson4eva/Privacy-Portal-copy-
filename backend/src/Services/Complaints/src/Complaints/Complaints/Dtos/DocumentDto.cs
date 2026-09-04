using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.Complaints.Dtos
{
    public class DocumentDto
    {
        public string? Documentation { get; set; }
        public List<FileDetailDto> Files { get; set; }
    }
}
