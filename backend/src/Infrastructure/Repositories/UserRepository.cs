using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class UserRepository(VagtplanDbContext db) : IUserRepository
{
    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default) =>
        await db.Users.AsNoTracking().OrderBy(u => u.FullName).ToListAsync(ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<bool> EmailExistsAsync(string normalizedEmail, Guid? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail
            && (!excludeId.HasValue || u.Id != excludeId.Value), cancellationToken);

    public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) =>
        db.Employments.AnyAsync(e => e.UserId == id, ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(User user, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    public async Task DeleteAsync(User user, CancellationToken ct = default)
    {
        db.Users.Remove(user);
        await db.SaveChangesAsync(ct);
    }
}
