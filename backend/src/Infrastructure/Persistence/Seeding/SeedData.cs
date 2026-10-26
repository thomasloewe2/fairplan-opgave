using Domain.Entities;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Seeding;

public static class SeedData
{
    // Fictional employees and reserved .example addresses; the records are not actual patient or staff data.
    private sealed record SectionSeed(int Number, string Name, string ColorHex);
    private sealed record GroupSeed(int Number, string Name);
    private sealed record StaffSeed(
        string FullName, int Section, int Group, int Hours, int Range, int? TransferSection = null);

    // Keep IDs 1 and 2 for existing sections and groups, so older local databases remain compatible.
    private static readonly SectionSeed[] Sections =
    [
            new(1, "Akutafsnit", "#2563EB"),
            new(2, "Medicinsk afsnit", "#059669"),
            new(3, "Kirurgisk sengeafsnit", "#D97706"),
            new(4, "Ortopædkirurgisk sengeafsnit", "#7C3AED"),
            new(5, "Intensivafsnit", "#DC2626"),
            new(6, "Hjerteafsnit", "#0891B2"),
            new(7, "Neurologisk sengeafsnit", "#4F46E5"),
            new(8, "Børneafsnit", "#DB2777"),
            new(9, "Fødegang", "#C026D3"),
            new(10, "Barselsafsnit", "#0D9488"),
            new(11, "Neonatalafsnit", "#9333EA"),
            new(12, "Psykiatrisk døgnafsnit", "#EA580C")
    ];

    private static readonly GroupSeed[] Groups =
    [
            new(1, "Læger"),
            new(2, "Sygeplejersker"),
            new(3, "Social- og sundhedsassistenter"),
            new(4, "Jordemødre"),
            new(5, "Pædagoger")
    ];

    // Six directly patient-facing employees per unit, plus the two original demo users.
    // The Range numbers refer to employment windows below, not to the planning periods.
    private static readonly StaffSeed[] Staff =
    [
            new("Mikkel Sørensen", 1, 1, 37, 0),
            new("Louise Nielsen", 1, 2, 37, 2),
            new("Camilla Poulsen", 1, 2, 32, 0),
            new("Anders Kristensen", 1, 1, 37, 1),
            new("Sara Møller", 1, 3, 30, 4),
            new("Jakob Holm", 1, 2, 28, 6),
            new("Rikke Mortensen", 2, 1, 37, 0),
            new("Thomas Rasmussen", 2, 2, 32, 1, 6),
            new("Julie Pedersen", 2, 2, 37, 2),
            new("Lars Andersen", 2, 1, 35, 0),
            new("Emma Sørensen", 2, 3, 30, 5),
            new("Freja Larsen", 2, 2, 28, 3),
            new("Martin Bjerre", 3, 1, 37, 0),
            new("Cecilie Madsen", 3, 2, 30, 1, 4),
            new("Pernille Bruun", 3, 2, 37, 2),
            new("Simon Nørgaard", 3, 1, 37, 4),
            new("Trine Christiansen", 3, 3, 32, 5),
            new("Mathias Vestergaard", 3, 2, 24, 6),
            new("Kaspar Holm", 4, 1, 37, 0),
            new("Caroline Faber", 4, 2, 32, 2),
            new("Mette Sten", 4, 2, 28, 3),
            new("Emil Høgh", 4, 1, 37, 6),
            new("Line Kirk", 4, 3, 30, 1),
            new("Frederik Bang", 4, 2, 35, 0),
            new("Nicolai Østergaard", 5, 1, 37, 0),
            new("Ida Friis", 5, 2, 37, 2),
            new("Maria Enevoldsen", 5, 2, 32, 0),
            new("Christian Bæk", 5, 1, 37, 4),
            new("Stine Lind", 5, 2, 30, 3),
            new("Tobias Lund", 5, 2, 28, 5),
            new("Jens Hald", 6, 1, 37, 0),
            new("Sofie Laursen", 6, 2, 32, 1),
            new("Laura Winther", 6, 2, 37, 2),
            new("Michael Bertelsen", 6, 1, 35, 0),
            new("Anne Kjær", 6, 2, 30, 6),
            new("Sarah Neumann", 6, 3, 28, 4),
            new("Kasper Fog", 7, 1, 37, 0),
            new("Nina Westergaard", 7, 2, 32, 2),
            new("Olivia Bach", 7, 2, 30, 3),
            new("Morten Skov", 7, 1, 37, 6),
            new("Silje Ebbesen", 7, 3, 28, 1),
            new("Malene Knudsen", 7, 2, 35, 0),
            new("Jonas Brandt", 8, 1, 37, 0),
            new("Katrine Øster", 8, 2, 37, 2),
            new("Amalie Hvid", 8, 2, 32, 1),
            new("Daniel From", 8, 1, 37, 4),
            new("Signe Eriksen", 8, 3, 28, 3),
            new("Cecilie Boe", 8, 2, 30, 6),
            new("Astrid Hjort", 9, 4, 37, 0),
            new("Nanna Jespersen", 9, 4, 30, 1, 10),
            new("Freja Overgaard", 9, 4, 32, 2),
            new("Bo Dam", 9, 1, 37, 0),
            new("Johanne Bro", 9, 4, 28, 3),
            new("Louise Brand", 9, 2, 30, 4),
            new("Elin Winther", 10, 4, 32, 1, 9),
            new("Camilla Birk", 10, 2, 37, 0),
            new("Karina Holm", 10, 4, 30, 2),
            new("Rasmus Lind", 10, 1, 37, 3),
            new("Lene Jensen", 10, 3, 28, 5),
            new("Mille Falk", 10, 2, 32, 6),
            new("Henrik Hjorth", 11, 1, 37, 0),
            new("Emma Uldall", 11, 2, 37, 2),
            new("Lærke Ravn", 11, 2, 32, 1),
            new("Poul Krogh", 11, 1, 35, 4),
            new("Ditte Toft", 11, 2, 30, 3, 8),
            new("Rebecca Lang", 11, 2, 28, 6),
            new("Peter Grøn", 12, 1, 37, 0),
            new("Helle Birk", 12, 2, 32, 2),
            new("Kim Egholm", 12, 2, 37, 1),
            new("Asta Rømer", 12, 5, 30, 4),
            new("Sanne Lyng", 12, 3, 28, 3),
            new("David Dal", 12, 2, 35, 6)
    ];

    private static Guid StableId(int category, int number) =>
        Guid.Parse($"{category}0000000-0000-0000-0000-{number:D12}");

    // Only invoked from Program.cs in Development. Re-running does not overwrite edited records.
    public static async Task InitializeAsync(VagtplanDbContext db, CancellationToken ct = default)
    {
        var existingSectionIds = (await db.Sections.AsNoTracking()
            .Select(s => s.Id).ToListAsync(ct)).ToHashSet();
        foreach (var section in Sections)
        {
            var id = StableId(1, section.Number);
            if (existingSectionIds.Add(id))
                db.Sections.Add(new Section { Id = id, Name = section.Name, ColorHex = section.ColorHex });
        }

        var existingGroupIds = (await db.StaffGroups.AsNoTracking()
            .Select(g => g.Id).ToListAsync(ct)).ToHashSet();
        foreach (var group in Groups)
        {
            var id = StableId(2, group.Number);
            if (existingGroupIds.Add(id))
                db.StaffGroups.Add(new StaffGroup { Id = id, Name = group.Name });
        }

        var existingUsers = await db.Users.AsNoTracking()
            .Select(u => new { u.Id, u.NormalizedEmail }).ToListAsync(ct);
        var userIds = existingUsers.Select(u => u.Id).ToHashSet();
        var normalizedEmails = existingUsers.Select(u => u.NormalizedEmail)
            .Where(email => email is not null).ToHashSet(StringComparer.OrdinalIgnoreCase);

        void AddUser(int number, string fullName, string email, bool isAdmin, bool isPersonnel)
        {
            var id = StableId(3, number);
            if (userIds.Contains(id)) return;

            // Respect manually created users and SQL Server's unique normalized-email index.
            if (!normalizedEmails.Add(email.ToUpperInvariant())) return;
            db.Users.Add(CreateUser(id, fullName, email, isAdmin, isPersonnel));
            userIds.Add(id);
        }

        // Preserve the original users and IDs relied upon by the browser regression tests.
        AddUser(1, "Anna Jensen", "anna@example.test", true, true);
        AddUser(2, "Peter Hansen", "peter@example.test", false, true);
        for (var i = 0; i < Staff.Length; i++)
            AddUser(i + 3, Staff[i].FullName, $"medarbejder{i + 3:D3}@sygehus.example",
                isAdmin: i is 0 or 48, isPersonnel: true);

        // Administrators without employment give the role filters and deletion rules useful test cases.
        AddUser(75, "Sofie Holm", "administration075@sygehus.example", true, false);
        AddUser(76, "Henrik Dahl", "administration076@sygehus.example", true, false);

        var existingPeriods = await db.Periods.AsNoTracking()
            .Select(p => new { p.Id, p.StartDate, p.EndDate }).ToListAsync(ct);
        var periodIntervals = existingPeriods.Select(p => (p.Id, p.StartDate, p.EndDate)).ToList();

        // Keep November/December IDs unchanged for backwards compatibility with existing tests.
        var months = new (int Number, int Year, int Month, string Name)[]
        {
            (3, 2026, 10, "Oktober 2026"),
            (1, 2026, 11, "November 2026"),
            (2, 2026, 12, "December 2026"),
            (4, 2027, 1, "Januar 2027"),
            (5, 2027, 2, "Februar 2027"),
            (6, 2027, 3, "Marts 2027")
        };
        foreach (var month in months)
        {
            var id = StableId(4, month.Number);
            if (periodIntervals.Any(p => p.Id == id)) continue;

            var start = new DateOnly(month.Year, month.Month, 1);
            var end = new DateOnly(month.Year, month.Month,
                DateTime.DaysInMonth(month.Year, month.Month));

            // If a developer already created the same month manually, preserve their period.
            if (periodIntervals.Any(p => p.StartDate <= end && start <= p.EndDate)) continue;

            db.Periods.Add(new Period { Id = id, Name = month.Name, StartDate = start, EndDate = end });
            periodIntervals.Add((id, start, end));
        }

        // Save principals before adding employments with restrictive foreign keys.
        await db.SaveChangesAsync(ct);

        var existingEmployments = await db.Employments.AsNoTracking()
            .Select(e => new { e.Id, e.UserId, e.StartDate, e.EndDate }).ToListAsync(ct);
        var employmentIds = existingEmployments.Select(e => e.Id).ToHashSet();
        var employmentIntervals = existingEmployments
            .Select(e => (e.UserId, e.StartDate, e.EndDate)).ToList();

        void AddEmployment(int number, int userNumber, int sectionNumber,
            int groupNumber, int hours, DateOnly start, DateOnly end)
        {
            var id = StableId(5, number);
            var userId = StableId(3, userNumber);
            var sectionId = StableId(1, sectionNumber);
            var groupId = StableId(2, groupNumber);
            if (employmentIds.Contains(id) || !userIds.Contains(userId)
                || !existingSectionIds.Contains(sectionId) || !existingGroupIds.Contains(groupId))
                return;

            // Never introduce overlaps for a user, even in a database with manually edited data.
            if (employmentIntervals.Any(e =>
                    e.UserId == userId && e.StartDate <= end && start <= e.EndDate))
                return;

            db.Employments.Add(new Employment
            {
                Id = id,
                UserId = userId,
                SectionId = sectionId,
                StaffGroupId = groupId,
                HoursPerWeek = hours,
                StartDate = start,
                EndDate = end
            });
            employmentIds.Add(id);
            employmentIntervals.Add((userId, start, end));
        }

        // Original demo employments; unchanged to support upgrading an existing local database.
        AddEmployment(1, 1, 1, 1, 37, new DateOnly(2026, 10, 1), new DateOnly(2027, 3, 31));
        AddEmployment(2, 2, 2, 2, 30, new DateOnly(2026, 11, 1), new DateOnly(2026, 12, 31));

        for (var i = 0; i < Staff.Length; i++)
        {
            var person = Staff[i];
            var number = i + 3;

            if (person.TransferSection is int nextSection)
            {
                // Transfer between wards, with no overlapping employment intervals.
                AddEmployment(number, number, person.Section, person.Group, person.Hours,
                    new DateOnly(2026, 10, 1), new DateOnly(2026, 12, 31));
                AddEmployment(number + 100, number, nextSection, person.Group, person.Hours,
                    new DateOnly(2027, 1, 1), new DateOnly(2027, 3, 31));
            }
            else
            {
                var (start, end) = EmploymentDates(person.Range);
                AddEmployment(number, number, person.Section, person.Group, person.Hours, start, end);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private static (DateOnly Start, DateOnly End) EmploymentDates(int range) => range switch
    {
        0 => (new(2026, 10, 1), new(2027, 3, 31)),
        1 => (new(2026, 10, 1), new(2026, 12, 31)),
        2 => (new(2026, 11, 1), new(2027, 2, 28)),
        3 => (new(2027, 1, 1), new(2027, 3, 31)),
        4 => (new(2026, 12, 1), new(2027, 3, 31)),
        5 => (new(2026, 10, 1), new(2027, 1, 31)),
        6 => (new(2026, 11, 1), new(2027, 3, 31)),
        7 => (new(2026, 10, 1), new(2026, 11, 30)),
        8 => (new(2027, 2, 1), new(2027, 3, 31)),
        _ => throw new ArgumentOutOfRangeException(nameof(range))
    };

    private static User CreateUser(Guid id, string name, string email, bool isAdmin, bool isPersonnel) =>
        new()
        {
            Id = id,
            FullName = name,
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            UserName = email,
            NormalizedUserName = email.ToUpperInvariant(),
            SecurityStamp = Guid.NewGuid().ToString(),
            IsAdmin = isAdmin,
            IsPersonnel = isPersonnel
        };
}
