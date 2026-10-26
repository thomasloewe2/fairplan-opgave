using Domain.Entities;

namespace Domain.Interfaces.Repositories;

public interface IStaffGroupRepository
{
    Task<IReadOnlyList<StaffGroup>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<StaffGroup?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> HasEmploymentsAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(StaffGroup staffGroup, CancellationToken cancellationToken = default);
    Task UpdateAsync(StaffGroup staffGroup, CancellationToken cancellationToken = default);
    Task DeleteAsync(StaffGroup staffGroup, CancellationToken cancellationToken = default);
}
