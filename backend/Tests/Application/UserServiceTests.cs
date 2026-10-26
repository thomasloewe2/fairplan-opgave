using Application.Contracts.Users;
using Application.Errors;
using Application.Services;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Tests.Application;

public sealed class UserServiceTests
{
    [Fact]
    public async Task Create_RejectsDuplicateEmailIgnoringCase()
    {
        var repo = new FakeUsers();
        var service = new UserService(repo);
        await service.CreateAsync(new CreateUserRequest("Anna", "anna@example.test", false, true));

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            service.CreateAsync(new CreateUserRequest("Another Anna", "ANNA@example.test", true, false)));

        Assert.Equal(ApplicationError.Conflict, ex.Error);
        Assert.Single(repo.Users);
    }

    [Fact]
    public async Task Update_CannotRemovePersonnelRoleWithEmployments()
    {
        var repo = new FakeUsers();
        var service = new UserService(repo);
        var user = await service.CreateAsync(new CreateUserRequest("Anna", "anna@example.test", true, true));
        repo.EmployedUserId = user.Id;

        var ex = await Assert.ThrowsAsync<BusinessException>(() =>
            service.UpdateAsync(user.Id, new UpdateUserRequest("Anna", "anna@example.test", true, false)));

        Assert.Equal(ApplicationError.Conflict, ex.Error);
    }

    [Fact]
    public async Task Delete_RejectsUserWithEmployments()
    {
        var repo = new FakeUsers();
        var service = new UserService(repo);
        var user = await service.CreateAsync(new CreateUserRequest("Anna", "anna@example.test", false, true));
        repo.EmployedUserId = user.Id;

        var ex = await Assert.ThrowsAsync<BusinessException>(() => service.DeleteAsync(user.Id));
        Assert.Equal(ApplicationError.Conflict, ex.Error);
    }

    private sealed class FakeUsers : IUserRepository
    {
        public List<User> Users { get; } = [];
        public Guid? EmployedUserId { get; set; }
        public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken ct = default) =>
            Task.FromResult<IReadOnlyList<User>>(Users);
        public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(Users.FirstOrDefault(u => u.Id == id));
        public Task<bool> EmailExistsAsync(string normalizedEmail, Guid? excludeId = null,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(Users.Any(u => u.NormalizedEmail == normalizedEmail && u.Id != excludeId));
        public Task<bool> HasEmploymentsAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult(EmployedUserId == id);
        public Task AddAsync(User user, CancellationToken ct = default) { Users.Add(user); return Task.CompletedTask; }
        public Task UpdateAsync(User user, CancellationToken ct = default) => Task.CompletedTask;
        public Task DeleteAsync(User user, CancellationToken ct = default) { Users.Remove(user); return Task.CompletedTask; }
    }
}
