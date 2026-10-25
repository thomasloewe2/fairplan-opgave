namespace Application.Contracts.Employments;

public sealed record CreateEmploymentRequest(Guid UserId, Guid SectionId, Guid StaffGroupId, int HoursPerWeek, DateOnly StartDate, DateOnly EndDate);
