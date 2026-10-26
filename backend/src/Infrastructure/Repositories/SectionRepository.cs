using Domain.Entities;
using Domain.Interfaces.Repositories;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public sealed class SectionRepository(VagtplanDbContext db) : ISectionRepository
{
    public async Task<IReadOnlyList<Section>> GetAllAsync(CancellationToken ct = default) =>
        await db.Sections.AsNoTracking().OrderBy(s => s.Name).ToListAsync(ct);

    public Task<Section?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        db.Sections.FirstOrDefaultAsync(s => s.Id == id, ct);

    public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) =>
        db.Employments.AnyAsync(e => e.SectionId == id, ct);

    public async Task AddAsync(Section section, CancellationToken ct = default)
    {
        db.Sections.Add(section);
        await db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(Section section, CancellationToken ct = default) =>
        db.SaveChangesAsync(ct);

    public async Task DeleteAsync(Section section, CancellationToken ct = default)
    {
        db.Sections.Remove(section);
        await db.SaveChangesAsync(ct);
    }
}
