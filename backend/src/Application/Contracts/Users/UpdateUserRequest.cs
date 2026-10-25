namespace Application.Contracts.Users;

public sealed record UpdateUserRequest(string FullName, string Email, bool IsAdmin, bool IsPersonnel);
