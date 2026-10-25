using Application.Contracts.Users;
using Domain.Entities;

namespace Application.Mapping;

public static class UserMapping
{
    // User.Email is nullable in Identity, but required by the application's use cases.
    public static UserResponse ToResponse(this User user) =>
        new(user.Id, user.FullName, user.Email ?? string.Empty, user.IsAdmin, user.IsPersonnel);
}
