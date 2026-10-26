using Application.Contracts.Periods;
using Application.Errors;
using Application.Mapping;
using Application.Validation;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class PeriodService(IPeriodRepository repository)
{
    public async Task<IReadOnlyList<PeriodResponse>> ListAsync(CancellationToken ct = default) =>
        (await repository.GetAllAsync(ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<PeriodResponse> GetAsync(Guid id, CancellationToken ct = default) =>
        (await FindAsync(id, ct)).ToResponse();

    public async Task<PeriodResponse> CreateAsync(CreatePeriodRequest request, CancellationToken ct = default)
    {
        Rules.DateInterval(request.StartDate, request.EndDate);
        var name = Rules.Name(request.Name, "Periodens navn");
        if (await repository.HasOverlapAsync(request.StartDate, request.EndDate, cancellationToken: ct))
            throw BusinessException.Conflict("Perioden overlapper en eksisterende periode.");

        var period = new Period { Name = name, StartDate = request.StartDate, EndDate = request.EndDate };
        await repository.AddAsync(period, ct);
        return period.ToResponse();
    }

    public async Task<PeriodResponse> UpdateAsync(Guid id, UpdatePeriodRequest request, CancellationToken ct = default)
    {
        var period = await FindAsync(id, ct);
        Rules.DateInterval(request.StartDate, request.EndDate);
        var name = Rules.Name(request.Name, "Periodens navn");
        // Exclude the period being edited so its existing dates do not conflict with themselves.
        if (await repository.HasOverlapAsync(request.StartDate, request.EndDate, excludeId: id, cancellationToken: ct))
            throw BusinessException.Conflict("Perioden overlapper en eksisterende periode.");

        period.Name = name;
        period.StartDate = request.StartDate;
        period.EndDate = request.EndDate;
        await repository.UpdateAsync(period, ct);
        return period.ToResponse();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default) =>
        await repository.DeleteAsync(await FindAsync(id, ct), ct);

    private async Task<Period> FindAsync(Guid id, CancellationToken ct) =>
        await repository.GetByIdAsync(id, ct) ?? throw BusinessException.Missing("Perioden blev ikke fundet.");
}
