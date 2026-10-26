using Application.Contracts.StaffGroups;
using Application.Errors;
using Application.Mapping;
using Application.Validation;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class StaffGroupService(IStaffGroupRepository repository)
{
    public async Task<IReadOnlyList<StaffGroupResponse>> ListAsync(CancellationToken ct = default) =>
        (await repository.GetAllAsync(ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<StaffGroupResponse> GetAsync(Guid id, CancellationToken ct = default) =>
        (await FindAsync(id, ct)).ToResponse();

    public async Task<StaffGroupResponse> CreateAsync(CreateStaffGroupRequest request, CancellationToken ct = default)
    {
        var group = new StaffGroup { Name = Rules.Name(request.Name, "Personalegruppens navn") };
        await repository.AddAsync(group, ct);
        return group.ToResponse();
    }

    public async Task<StaffGroupResponse> UpdateAsync(Guid id, UpdateStaffGroupRequest request, CancellationToken ct = default)
    {
        var group = await FindAsync(id, ct);
        group.Name = Rules.Name(request.Name, "Personalegruppens navn");
        await repository.UpdateAsync(group, ct);
        return group.ToResponse();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var group = await FindAsync(id, ct);
        if (await repository.HasEmploymentsAsync(id, ct))
            throw ApplicationException.Conflict("Personalegruppen kan ikke slettes, da den har tilknyttede ansættelser.");
        await repository.DeleteAsync(group, ct);
    }

    private async Task<StaffGroup> FindAsync(Guid id, CancellationToken ct) =>
        await repository.GetByIdAsync(id, ct) ?? throw ApplicationException.Missing("Personalegruppen blev ikke fundet.");
}
