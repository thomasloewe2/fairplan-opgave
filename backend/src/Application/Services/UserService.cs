using Application.Contracts.Users;
using Application.Errors;
using Application.Mapping;
using Application.Validation;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class UserService(IUserRepository repository)
{
    public async Task<IReadOnlyList<UserResponse>> ListAsync(CancellationToken ct = default) =>
        (await repository.GetAllAsync(ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<UserResponse> GetAsync(Guid id, CancellationToken ct = default) =>
        (await FindAsync(id, ct)).ToResponse();

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        var name = Rules.Name(request.FullName, "Brugerens navn");
        var email = Rules.Email(request.Email);
        Rules.UserRoles(request.IsAdmin, request.IsPersonnel);
        var normalized = email.ToUpperInvariant();
        if (await repository.EmailExistsAsync(normalized, cancellationToken: ct))
            throw ApplicationException.Conflict("E-mailadressen er allerede i brug.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            Email = email,
            NormalizedEmail = normalized,
            UserName = email,
            NormalizedUserName = normalized,
            SecurityStamp = Guid.NewGuid().ToString(),
            IsAdmin = request.IsAdmin,
            IsPersonnel = request.IsPersonnel
        };
        await repository.AddAsync(user, ct);
        return user.ToResponse();
    }

    public async Task<UserResponse> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await FindAsync(id, ct);
        var name = Rules.Name(request.FullName, "Brugerens navn");
        var email = Rules.Email(request.Email);
        Rules.UserRoles(request.IsAdmin, request.IsPersonnel);
        var normalized = email.ToUpperInvariant();

        if (await repository.EmailExistsAsync(normalized, excludeId: id, cancellationToken: ct))
            throw ApplicationException.Conflict("E-mailadressen er allerede i brug.");
        if (user.IsPersonnel && !request.IsPersonnel && await repository.HasEmploymentsAsync(id, ct))
            throw ApplicationException.Conflict("Personale-rollen kan ikke fjernes fra en bruger med ansættelser.");

        user.FullName = name;
        user.Email = email;
        user.NormalizedEmail = normalized;
        user.UserName = email;
        user.NormalizedUserName = normalized;
        user.IsAdmin = request.IsAdmin;
        user.IsPersonnel = request.IsPersonnel;
        await repository.UpdateAsync(user, ct);
        return user.ToResponse();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await FindAsync(id, ct);
        if (await repository.HasEmploymentsAsync(id, ct))
            throw ApplicationException.Conflict("Brugeren kan ikke slettes, da vedkommende har ansættelser.");
        await repository.DeleteAsync(user, ct);
    }

    private async Task<User> FindAsync(Guid id, CancellationToken ct) =>
        await repository.GetByIdAsync(id, ct) ?? throw ApplicationException.Missing("Brugeren blev ikke fundet.");
}
