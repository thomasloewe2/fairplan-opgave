using Application.Contracts.StaffGroups;
using Domain.Entities;

namespace Application.Mapping;

public static class StaffGroupMapping
{
    public static StaffGroupResponse ToResponse(this StaffGroup staffGroup) =>
        new(staffGroup.Id, staffGroup.Name);
}
