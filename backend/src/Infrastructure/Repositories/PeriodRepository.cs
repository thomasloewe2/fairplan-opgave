using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class PeriodRepository(VagtplanDbContext db) : IPeriodRepository
{
    public async Task<IReadOnlyList<Period>> GetAllAsync(CancellationToken ct = default) =>
        await db.Periods.AsNoTracking().OrderBy(p => p.StartDate).ToListAsync(ct);

    public Task<Period?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Periods.FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> HasOverlapAsync(DateOnly startDate, DateOnly endDate, Guid? excludeId = null, CancellationToken cancellationToken = default) =>
        db.Periods.AnyAsync(p => (!excludeId.HasValue || p.Id != excludeId.Value)
            && p.StartDate <= endDate && startDate <= p.EndDate, cancellationToken);

    public async Task AddAsync(Period period, CancellationToken ct = default)
    {
        db.Periods.Add(period);
        await db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(Period period, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    public async Task DeleteAsync(Period period, CancellationToken ct = default)
    {
        db.Periods.Remove(period);
        await db.SaveChangesAsync(ct);
    }
}
