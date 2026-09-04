using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace AccessedServices.AccessedServices.Models
{
    public enum PublishStatus
    {
        NotStarted = 1,
        InDevelopment = 2,
        InUAT = 3,
        InProduction = 4,
        Completed = 5
    }

    public class PublishWorkflowStatus
    {
        public static string CURRENT = "current";
        public required string Id { get; set; }
        public required int Status { get; set; }
        public required string Guid { get; set; }
        public string? Description { get; set; }
        public string? UserEmail { get; set; }
        public DateTime? InitiatedAt { get; set; }
        public bool? PreviewedInDev { get; set; }
        public bool? PreviewedInUAT { get; set; }
        public bool? PreviewedInProd { get; set; }
        public DateTime? ConfirmedInDevAt { get; set; }
        public DateTime? ConfirmedInUATAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Error { get; set; }
    }
}
