namespace Application.Errors;

public enum ApplicationError { Validation, NotFound, Conflict }

public sealed class BusinessException(string message, ApplicationError error) : Exception(message)
{
    public ApplicationError Error { get; } = error;

    public static BusinessException Invalid(string message) => new(message, ApplicationError.Validation);
    public static BusinessException Missing(string message) => new(message, ApplicationError.NotFound);
    public static BusinessException Conflict(string message) => new(message, ApplicationError.Conflict);
}
