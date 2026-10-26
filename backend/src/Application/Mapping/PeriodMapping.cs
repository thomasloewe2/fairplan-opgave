using Application.Contracts.Periods;
using Domain.Entities;

namespace Application.Mapping;

public static class PeriodMapping
{
    public static PeriodResponse ToResponse(this Period period) =>
        new(period.Id, period.Name, period.StartDate, period.EndDate);
}
