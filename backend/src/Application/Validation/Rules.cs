using System.Net.Mail;
using System.Text.RegularExpressions;
using Application.Errors;

namespace Application.Validation;

public static partial class Rules
{
    public static string Name(string? name, string label)
    {
        var value = name?.Trim();
        if (string.IsNullOrWhiteSpace(value) || value.Length > 100)
            throw ApplicationException.Invalid($"{label} skal indeholde mellem 1 og 100 tegn.");
        return value;
    }

    public static string Color(string? hex)
    {
        var value = hex?.Trim();
        if (value is null || !HexColorRegex().IsMatch(value))
            throw ApplicationException.Invalid("Farvekoden skal være en HEX-farve, f.eks. #3B82F6.");
        return value.ToUpperInvariant();
    }

    public static string Email(string? email)
    {
        var value = email?.Trim();
        if (string.IsNullOrWhiteSpace(value) || value.Length > 254 ||
            !MailAddress.TryCreate(value, out var address) ||
            !string.Equals(address.Address, value, StringComparison.OrdinalIgnoreCase) ||
            !value.Contains('.'))
            throw ApplicationException.Invalid("Angiv en gyldig e-mailadresse.");
        return value;
    }

    public static void DateInterval(DateOnly start, DateOnly end)
    {
        if (start == default || end == default || start >= end)
            throw ApplicationException.Invalid("Startdato skal ligge før slutdato.");
    }

    public static void Hours(int hours)
    {
        if (hours is < 0 or > 37)
            throw ApplicationException.Invalid("Timer pr. uge skal være mellem 0 og 37.");
    }

    public static void UserRoles(bool isAdmin, bool isPersonnel)
    {
        if (!isAdmin && !isPersonnel)
            throw ApplicationException.Invalid("Brugeren skal have mindst én rolle.");
    }

    [GeneratedRegex("^#[0-9A-Fa-f]{6}$", RegexOptions.CultureInvariant)]
    private static partial Regex HexColorRegex();
}
