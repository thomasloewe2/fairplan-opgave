namespace Application.Errors;

public enum ApplicationError { Validation, NotFound, Conflict }

public sealed class ApplicationException(string message, ApplicationError error) : Exception(message)
{
    public ApplicationError Error { get; } = error;

    public static ApplicationException Invalid(string message) => new(message, ApplicationError.Validation);
    public static ApplicationException Missing(string message) => new(message, ApplicationError.NotFound);
    public static ApplicationException Conflict(string message) => new(message, ApplicationError.Conflict);
}
