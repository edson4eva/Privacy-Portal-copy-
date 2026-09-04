using Complaints.Complaints.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Complaints.Complaints.Models
{
    public class Document
    {
        /// <summary>
        /// This must match one of the predefined values as defined in the <see cref="DocumentTypes"/> class.
        /// </summary>
        public List<FileDetail> Files { get; set; }
        public string? Documentation { get; set; }
        public required string ReferenceId { get; set; }
        public required DateTime UploadedDateTime { get; set; }
    }
}
