namespace Application.Contracts.Periods;

public sealed record CreatePeriodRequest(string Name, DateOnly StartDate, DateOnly EndDate);
