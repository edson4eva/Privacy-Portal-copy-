using Complaints.Complaints.Dtos;
using Mapster;
namespace Complaints.Complaints.Features;

using CreatingComplaints.V1;

public class ComplaintsMappings : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.Default.NameMatchingStrategy(NameMatchingStrategy.Flexible);


        config.NewConfig<Models.Complaint, CreateComplaintResponseDto>()
            .ConstructUsing(x => new CreateComplaintResponseDto(Guid.Parse(x.Id), x.CreatedDate));

        //Add Complaints related Model/DTO mappings here
        config.NewConfig<CreateComplaintRequestDto, CreateComplaint>()
                .ConstructUsing(obj => new CreateComplaint(
                    new CreateComplaintDto
                    {
                        Department = obj.Department,
                        Service = obj.Service,
                        Concern = obj.Concern,
                        Circumstances = obj.Circumstances,
                        EmployeeName = obj.EmployeeName,
                        ComplaineeContactInfo = obj.ComplaineeContactInfo,
                        Documents = obj.Documents
                    }));
    }
}
