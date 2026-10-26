using Application.Contracts.Employments;
using Application.Errors;
using Application.Mapping;
using Application.Validation;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class EmploymentService(
    IEmploymentRepository repository,
    IUserRepository users,
    ISectionRepository sections,
    IStaffGroupRepository groups)
{
    public async Task<IReadOnlyList<EmploymentResponse>> ListAsync(CancellationToken ct = default) =>
        (await repository.GetAllAsync(ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<EmploymentResponse> GetAsync(Guid id, CancellationToken ct = default) =>
        (await FindAsync(id, ct)).ToResponse();

    public async Task<EmploymentResponse> CreateAsync(CreateEmploymentRequest request, CancellationToken ct = default)
    {
        await ValidateAsync(request.UserId, request.SectionId, request.StaffGroupId,
            request.HoursPerWeek, request.StartDate, request.EndDate, null, ct);
        var employment = new Employment
        {
            UserId = request.UserId,
            SectionId = request.SectionId,
            StaffGroupId = request.StaffGroupId,
            HoursPerWeek = request.HoursPerWeek,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };
        await repository.AddAsync(employment, ct);
        return employment.ToResponse();
    }

    public async Task<EmploymentResponse> UpdateAsync(Guid id, UpdateEmploymentRequest request, CancellationToken ct = default)
    {
        var employment = await FindAsync(id, ct);
        await ValidateAsync(request.UserId, request.SectionId, request.StaffGroupId,
            request.HoursPerWeek, request.StartDate, request.EndDate, id, ct);

        employment.UserId = request.UserId;
        employment.SectionId = request.SectionId;
        employment.StaffGroupId = request.StaffGroupId;
        employment.HoursPerWeek = request.HoursPerWeek;
        employment.StartDate = request.StartDate;
        employment.EndDate = request.EndDate;
        await repository.UpdateAsync(employment, ct);
        return employment.ToResponse();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) =>
        await repository.DeleteAsync(await FindAsync(id, ct), ct);

    private async Task ValidateAsync(Guid userId, Guid sectionId, Guid groupId,
        int hours, DateOnly start, DateOnly end, Guid? excludeId, CancellationToken ct)
    {
        Rules.DateInterval(start, end);
        Rules.Hours(hours);
        if (userId == Guid.Empty || sectionId == Guid.Empty || groupId == Guid.Empty)
            throw BusinessException.Invalid("Bruger, afsnit og personalegruppe skal vælges.");

        var user = await users.GetByIdAsync(userId, ct)
            ?? throw BusinessException.Invalid("Den valgte bruger findes ikke.");
        if (!user.IsPersonnel)
            throw BusinessException.Invalid("Brugeren skal have rollen Personale.");
        if (await sections.GetByIdAsync(sectionId, ct) is null)
            throw BusinessException.Invalid("Det valgte afsnit findes ikke.");
        if (await groups.GetByIdAsync(groupId, ct) is null)
            throw BusinessException.Invalid("Den valgte personalegruppe findes ikke.");
        // Employments may change section or group over time, but not overlap for the same user.
        if (await repository.HasOverlapForUserAsync(userId, start, end, excludeId, ct))
            throw BusinessException.Conflict("Brugeren har allerede en ansættelse i den valgte periode.");
    }

    private async Task<Employment> FindAsync(Guid id, CancellationToken ct) =>
        await repository.GetByIdAsync(id, ct) ?? throw BusinessException.Missing("Ansættelsen blev ikke fundet.");
}
