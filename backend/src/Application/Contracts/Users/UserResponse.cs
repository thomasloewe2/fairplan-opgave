namespace Application.Contracts.Users;

public sealed record UserResponse(Guid Id, string FullName, string Email, bool IsAdmin, bool IsPersonnel);
