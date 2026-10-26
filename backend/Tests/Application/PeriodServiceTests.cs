using Application.Contracts.Periods;
using Application.Errors;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Tests.Application;

public sealed class PeriodServiceTests
{
    [Fact]
    public async Task Create_RejectsOverlappingPeriod()
    {
        var repository = new FakePeriods();
        repository.Items.Add(new Period { Name = "November",
            StartDate = new DateOnly(2026, 11, 1), EndDate = new DateOnly(2026, 11, 30) });

        var service = new PeriodService(repository);
        var exception = await Assert.ThrowsAsync<BusinessException>(() =>
            service.CreateAsync(new CreatePeriodRequest("Overlap",
                new DateOnly(2026, 11, 30), new DateOnly(2026, 12, 5))));

        Assert.Equal(ApplicationError.Conflict, exception.Error);
    }

    [Fact]
    public async Task Create_AllowsAdjacentNonOverlappingPeriod()
    {
        var repository = new FakePeriods();
        repository.Items.Add(new Period { Name = "November",
            StartDate = new DateOnly(2026, 11, 1), EndDate = new DateOnly(2026, 11, 30) });

        var service = new PeriodService(repository);
        var result = await service.CreateAsync(new CreatePeriodRequest("December",
            new DateOnly(2026, 12, 1), new DateOnly(2026, 12, 31)));

        Assert.Equal("December", result.Name);
        Assert.Equal(2, repository.Items.Count);
    }

    [Fact]
    public async Task Update_ExcludesPeriodBeingEditedFromOverlapCheck()
    {
        var repository = new FakePeriods();
        var existing = new Period { Name = "Original",
            StartDate = new DateOnly(2026, 11, 1), EndDate = new DateOnly(2026, 11, 30) };
        repository.Items.Add(existing);
        var service = new PeriodService(repository);

        var result = await service.UpdateAsync(existing.Id, new UpdatePeriodRequest("Rettet",
            existing.StartDate, existing.EndDate));

        Assert.Equal("Rettet", result.Name);
    }

    private sealed class FakePeriods : IPeriodRepository
    {
        public List<Period> Items { get; } = [];
        public Task<IReadOnlyList<Period>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<Period>>(Items);
        public Task<Period?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(Items.FirstOrDefault(p => p.Id == id));
        public Task<bool> HasOverlapAsync(DateOnly startDate, DateOnly endDate,
            Guid? excludeId = null, CancellationToken cancellationToken = default) =>
            Task.FromResult(Items.Any(p => p.Id != excludeId &&
                p.StartDate <= endDate && startDate <= p.EndDate));
        public Task AddAsync(Period period, CancellationToken ct = default) { Items.Add(period); return Task.CompletedTask; }
        public Task UpdateAsync(Period period, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(Period period, CancellationToken ct = default) { Items.Remove(period); return Task.CompletedTask; }
    }
}
