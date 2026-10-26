using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class StaffGroupRepository(VagtplanDbContext db) : IStaffGroupRepository
{
    public async Task<IReadOnlyList<StaffGroup>> GetAllAsync(CancellationToken ct = default) =>
        await db.StaffGroups.AsNoTracking().OrderBy(g => g.Name).ToListAsync(ct);

    public Task<StaffGroup?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.StaffGroups.FirstOrDefaultAsync(g => g.Id == id, ct);

    public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) =>
        db.Employments.AnyAsync(e => e.StaffGroupId == id, ct);

    public async Task AddAsync(StaffGroup group, CancellationToken ct = default)
    {
        db.StaffGroups.Add(group);
        await db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(StaffGroup group, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    public async Task DeleteAsync(StaffGroup group, CancellationToken ct = default)
    {
        db.StaffGroups.Remove(group);
        await db.SaveChangesAsync(ct);
    }
}
