using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IEmploymentRepository
{
    Task<IReadOnlyList<Employment>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Employment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasOverlapForUserAsync(Guid userId, DateOnly startDate, DateOnly endDate, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Employment>> GetForPeriodAsync(DateOnly periodStart, DateOnly periodEnd, CancellationToken cancellationToken = default);
    Task AddAsync(Employment employment, CancellationToken cancellationToken = default);
    Task UpdateAsync(Employment employment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Employment employment, CancellationToken cancellationToken = default);
}
