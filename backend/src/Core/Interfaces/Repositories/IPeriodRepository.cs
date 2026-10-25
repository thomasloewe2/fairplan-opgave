using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IPeriodRepository
{
    Task<IReadOnlyList<Period>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Period?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasOverlapAsync(DateOnly startDate, DateOnly endDate, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Period period, CancellationToken cancellationToken = default);
    Task UpdateAsync(Period period, CancellationToken cancellationToken = default);
    Task DeleteAsync(Period period, CancellationToken cancellationToken = default);
}
