using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface ISectionRepository
{
    Task<IReadOnlyList<Section>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Section?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasEmploymentsAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Section section, CancellationToken cancellationToken = default);
    Task UpdateAsync(Section section, CancellationToken cancellationToken = default);
    Task DeleteAsync(Section section, CancellationToken cancellationToken = default);
}
