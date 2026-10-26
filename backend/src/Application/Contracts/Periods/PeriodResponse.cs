namespace Application.Contracts.Periods;

public sealed record PeriodResponse(Guid Id, string Name, DateOnly StartDate, DateOnly EndDate);
