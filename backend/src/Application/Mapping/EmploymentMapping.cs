using Application.Contracts.Employments;
using Application.Contracts.Personnel;
using Domain.Entities;

namespace Application.Mapping;

public static class EmploymentMapping
{
    public static EmploymentResponse ToResponse(this Employment employment) =>
        new(employment.Id, employment.UserId, employment.SectionId, employment.StaffGroupId, employment.HoursPerWeek, employment.StartDate, employment.EndDate);

    // Caller must load User, Section and StaffGroup for personnel projections.
    public static PersonnelResponse ToPersonnelResponse(this Employment employment) =>
        new(employment.Id, employment.User.FullName, employment.Section.Name, employment.StaffGroup.Name, employment.HoursPerWeek);
}
