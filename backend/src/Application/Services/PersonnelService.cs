using Application.Contracts.Personnel;
using Application.Errors;
using Application.Mapping;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class PersonnelService(IPeriodRepository periods, IEmploymentRepository employments)
{
    public async Task<IReadOnlyList<PersonnelResponse>> GetForPeriodAsync(Guid periodId, CancellationToken ct = default)
    {
        var period = await periods.GetByIdAsync(periodId, ct)
            ?? throw BusinessException.Missing("Perioden blev ikke fundet.");

        var matches = await employments.GetForPeriodAsync(period.StartDate, period.EndDate, ct);
        return matches.Select(x => x.ToPersonnelResponse())
            .OrderBy(x => x.FullName).ThenBy(x => x.SectionName).ToArray();
    }
}
