using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class EmploymentRepository(VagtplanDbContext db) : IEmploymentRepository
{
    public async Task<IReadOnlyList<Employment>> GetAllAsync(CancellationToken ct = default) =>
        await db.Employments.AsNoTracking().OrderBy(e => e.StartDate).ToListAsync(ct);

    public Task<Employment?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Employments.FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<bool> HasOverlapForUserAsync(Guid userId, DateOnly startDate, DateOnly endDate,
        Guid? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Employments.AnyAsync(e => e.UserId == userId
            && (!excludeId.HasValue || e.Id != excludeId.Value)
            && e.StartDate <= endDate && startDate <= e.EndDate, cancellationToken);

    public async Task<IReadOnlyList<Employment>> GetForPeriodAsync(DateOnly periodStart,
        DateOnly periodEnd, CancellationToken ct = default) =>
        await db.Employments.AsNoTracking()
            .Include(e => e.User).Include(e => e.Section).Include(e => e.StaffGroup)
            .Where(e => e.StartDate <= periodEnd && periodStart <= e.EndDate)
            .OrderBy(e => e.User.FullName).ThenBy(e => e.StartDate)
            .ToListAsync(ct);

    public async Task AddAsync(Employment employment, CancellationToken ct = default)
    {
        db.Employments.Add(employment);
        await db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(Employment employment, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    public async Task DeleteAsync(Employment employment, CancellationToken ct = default)
    {
        db.Employments.Remove(employment);
        await db.SaveChangesAsync(ct);
    }
}
