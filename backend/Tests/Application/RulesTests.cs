using Application.Errors;
using Application.Validation;

namespace Tests.Application;

public sealed class RulesTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(37)]
    public void Hours_AcceptsAllowedEndpoints(int hours) => Rules.Hours(hours);

    [Theory]
    [InlineData(-1)]
    [InlineData(38)]
    public void Hours_RejectsValuesOutsideRange(int hours) =>
        Assert.Throws<BusinessException>(() => Rules.Hours(hours));

    [Fact]
    public void DateInterval_RequiresStrictlyIncreasingDates()
    {
        var date = new DateOnly(2026, 11, 1);
        Assert.Throws<BusinessException>(() => Rules.DateInterval(date, date));
        Assert.Throws<BusinessException>(() => Rules.DateInterval(date, date.AddDays(-1)));
        Rules.DateInterval(date, date.AddDays(1));
    }

    [Theory]
    [InlineData("#123abc", "#123ABC")]
    [InlineData(" #abcdef ", "#ABCDEF")]
    public void Color_ValidatesAndNormalizesHex(string input, string expected) =>
        Assert.Equal(expected, Rules.Color(input));

    [Theory]
    [InlineData("#FFF")]
    [InlineData("red")]
    [InlineData("#ZZZZZZ")]
    public void Color_RejectsInvalidHex(string input) =>
        Assert.Throws<BusinessException>(() => Rules.Color(input));

    [Fact]
    public void UserRoles_RequireAtLeastOneRole()
    {
        Assert.Throws<BusinessException>(() => Rules.UserRoles(false, false));
        Rules.UserRoles(true, false);
        Rules.UserRoles(false, true);
        Rules.UserRoles(true, true);
    }
}
