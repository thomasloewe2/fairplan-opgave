namespace Application.Contracts.Personnel;

// Each matching employment is a separate row in the personnel overview.
public sealed record PersonnelResponse(Guid EmploymentId, string FullName, string SectionName, string StaffGroupName, int HoursPerWeek);
