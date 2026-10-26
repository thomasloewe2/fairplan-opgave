using Application.Contracts.Employments;
using Application.Errors;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Tests.Application;

public sealed class EmploymentServiceTests
{
    [Fact]
    public async Task Create_RequiresPersonnelRole()
    {
        var fixture = new EmploymentFixture(isPersonnel: false);
        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            fixture.Service.CreateAsync(fixture.Request));
        Assert.Equal(ApplicationError.Validation, ex.Error);
    }

    [Fact]
    public async Task Create_RejectsOverlappingEmploymentForSameUser()
    {
        var fixture = new EmploymentFixture();
        await fixture.Service.CreateAsync(fixture.Request);
        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            fixture.Service.CreateAsync(fixture.Request));
        Assert.Equal(ApplicationError.Conflict, ex.Error);
    }

    [Fact]
    public async Task Create_AllowsConsecutiveEmployments()
    {
        var fixture = new EmploymentFixture();
        await fixture.Service.CreateAsync(fixture.Request);
        var next = fixture.Request with
        {
            StartDate = new DateOnly(2026, 12, 1),
            EndDate = new DateOnly(2026, 12, 31)
        };
        await fixture.Service.CreateAsync(next);
        Assert.Equal(2, fixture.Employments.Items.Count);
    }

    private sealed class EmploymentFixture
    {
        public FakeEmployments Employments { get; } = new();
        public EmploymentService Service { get; }
        public CreateEmploymentRequest Request { get; }

        public EmploymentFixture(bool isPersonnel = true)
        {
            var user = new User { Id = Guid.NewGuid(), FullName = "Test", IsPersonnel = isPersonnel };
            var section = new Section { Id = Guid.NewGuid(), Name = "A" };
            var group = new StaffGroup { Id = Guid.NewGuid(), Name = "B" };
            Request = new CreateEmploymentRequest(user.Id, section.Id, group.Id, 37,
                new DateOnly(2026, 11, 1), new DateOnly(2026, 11, 30));
            Service = new EmploymentService(Employments, new FakeUsers(user), new FakeSections(section), new FakeGroups(group));
        }
    }

    private sealed class FakeEmployments : IEmploymentRepository
    {
        public List<Employment> Items { get; } = [];
        public Task<IReadOnlyList<Employment>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<Employment>>(Items);
        public Task<Employment?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(Items.FirstOrDefault(e => e.Id == id));
        public Task<bool> HasOverlapForUserAsync(Guid userId, DateOnly start, DateOnly end,
            Guid? excludeId = null, CancellationToken cancellationToken = default) =>
            Task.FromResult(Items.Any(e => e.UserId == userId && e.Id != excludeId
                && e.StartDate <= end && start <= e.EndDate));
        public Task<IReadOnlyList<Employment>> GetForPeriodAsync(DateOnly start, DateOnly end,
            CancellationToken ct = default) => Task.FromResult<IReadOnlyList<Employment>>([]);
        public Task AddAsync(Employment value, CancellationToken ct = default) { Items.Add(value); return Task.CompletedTask; }
        public Task UpdateAsync(Employment value, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(Employment value, CancellationToken ct = default) { Items.Remove(value); return Task.CompletedTask; }
    }

    private sealed class FakeUsers(User user) : IUserRepository
    {
        public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<User>>([user]);
        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(id == user.Id ? user : null);
        public Task<bool> EmailExistsAsync(string email, Guid? excludeId = null,
            CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) => Task.FromResult(false);
        public Task AddAsync(User value, CancellationToken ct = default) => Task.CompletedTask;
        public Task UpdateAsync(User value, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(User value, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class FakeSections(Section section) : ISectionRepository
    {
        public Task<IReadOnlyList<Section>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<Section>>([section]);
        public Task<Section?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(id == section.Id ? section : null);
        public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) => Task.FromResult(false);
        public Task AddAsync(Section value, CancellationToken ct = default) => Task.CompletedTask;
        public Task UpdateAsync(Section value, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(Section value, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class FakeGroups(StaffGroup group) : IStaffGroupRepository
    {
        public Task<IReadOnlyList<StaffGroup>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<StaffGroup>>([group]);
        public Task<StaffGroup?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(id == group.Id ? group : null);
        public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) => Task.FromResult(false);
        public Task AddAsync(StaffGroup value, CancellationToken ct = default) => Task.CompletedTask;
        public Task UpdateAsync(StaffGroup value, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(StaffGroup value, CancellationToken ct = default) => Task.CompletedTask;
    }
}
