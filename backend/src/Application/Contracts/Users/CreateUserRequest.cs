namespace Application.Contracts.Users;

public sealed record CreateUserRequest(string FullName, string Email, bool IsAdmin, bool IsPersonnel);
