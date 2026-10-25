namespace Application.Contracts.Periods;

public sealed record UpdatePeriodRequest(string Name, DateOnly StartDate, DateOnly EndDate);
