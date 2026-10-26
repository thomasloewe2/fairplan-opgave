using Domain.Entities;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Seeding;

public static class SeedData
{
    // Development-only example records with stable IDs; safe to call more than once.
    public static async Task InitializeAsync(VagtplanDbContext db, CancellationToken ct = default)
    {
        var section1Id = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var section2Id = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var group1Id = Guid.Parse("20000000-0000-0000-0000-000000000001");
        var group2Id = Guid.Parse("20000000-0000-0000-0000-000000000002");
        var user1Id = Guid.Parse("30000000-0000-0000-0000-000000000001");
        var user2Id = Guid.Parse("30000000-0000-0000-0000-000000000002");

        if (!await db.Sections.AnyAsync(s => s.Id == section1Id, ct))
            db.Sections.Add(new Section { Id = section1Id, Name = "Akutafsnit", ColorHex = "#2563EB" });
        if (!await db.Sections.AnyAsync(s => s.Id == section2Id, ct))
            db.Sections.Add(new Section { Id = section2Id, Name = "Medicinsk afsnit", ColorHex = "#059669" });

        if (!await db.StaffGroups.AnyAsync(s => s.Id == group1Id, ct))
            db.StaffGroups.Add(new StaffGroup { Id = group1Id, Name = "Læger" });
        if (!await db.StaffGroups.AnyAsync(s => s.Id == group2Id, ct))
            db.StaffGroups.Add(new StaffGroup { Id = group2Id, Name = "Sygeplejersker" });

        if (!await db.Users.AnyAsync(u => u.Id == user1Id, ct))
            db.Users.Add(CreateUser(user1Id, "Anna Jensen", "anna@example.test", true, true));
        if (!await db.Users.AnyAsync(u => u.Id == user2Id, ct))
            db.Users.Add(CreateUser(user2Id, "Peter Hansen", "peter@example.test", false, true));

        var period1Id = Guid.Parse("40000000-0000-0000-0000-000000000001");
        var period2Id = Guid.Parse("40000000-0000-0000-0000-000000000002");
        if (!await db.Periods.AnyAsync(p => p.Id == period1Id, ct))
            db.Periods.Add(new Period { Id = period1Id, Name = "November 2026",
                StartDate = new DateOnly(2026, 11, 1), EndDate = new DateOnly(2026, 11, 30) });
        if (!await db.Periods.AnyAsync(p => p.Id == period2Id, ct))
            db.Periods.Add(new Period { Id = period2Id, Name = "December 2026",
                StartDate = new DateOnly(2026, 12, 1), EndDate = new DateOnly(2026, 12, 31) });
        await db.SaveChangesAsync(ct);

        var employment1Id = Guid.Parse("50000000-0000-0000-0000-000000000001");
        var employment2Id = Guid.Parse("50000000-0000-0000-0000-000000000002");
        if (!await db.Employments.AnyAsync(e => e.Id == employment1Id, ct))
            db.Employments.Add(new Employment { Id = employment1Id, UserId = user1Id,
                SectionId = section1Id, StaffGroupId = group1Id, HoursPerWeek = 37,
                StartDate = new DateOnly(2026, 10, 1), EndDate = new DateOnly(2027, 3, 31) });
        if (!await db.Employments.AnyAsync(e => e.Id == employment2Id, ct))
            db.Employments.Add(new Employment { Id = employment2Id, UserId = user2Id,
                SectionId = section2Id, StaffGroupId = group2Id, HoursPerWeek = 30,
                StartDate = new DateOnly(2026, 11, 1), EndDate = new DateOnly(2026, 12, 31) });
        await db.SaveChangesAsync(ct);
    }

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
