namespace Application.Contracts.Employments;

public sealed record EmploymentResponse(Guid Id, Guid UserId, Guid SectionId, Guid StaffGroupId, int HoursPerWeek, DateOnly StartDate, DateOnly EndDate);
