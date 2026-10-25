namespace Application.Contracts.Employments;

public sealed record UpdateEmploymentRequest(Guid UserId, Guid SectionId, Guid StaffGroupId, int HoursPerWeek, DateOnly StartDate, DateOnly EndDate);
