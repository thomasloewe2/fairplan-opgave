using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Contexts;

public class VagtplanDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public VagtplanDbContext(DbContextOptions<VagtplanDbContext> options)
        : base(options) { }

    public DbSet<Period> Periods => Set<Period>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<StaffGroup> StaffGroups => Set<StaffGroup>();
    public DbSet<Employment> Employments => Set<Employment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            // ASP.NET Identity's default EmailIndex is non-unique. Make it unique for this domain.
            entity.HasIndex(u => u.NormalizedEmail).IsUnique().HasDatabaseName("EmailIndex");
            // Restrict deletion at database level even if a caller bypasses service validation.
            entity.HasMany(u => u.Employments).WithOne(e => e.User)
                .HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
            entity.ToTable(t => t.HasCheckConstraint("CK_Period_Dates", "[StartDate] < [EndDate]"));
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.ColorHex).IsRequired().HasMaxLength(7);
        });

        modelBuilder.Entity<StaffGroup>(entity =>
        {
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Employment>(entity =>
        {
            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Employment_Dates", "[StartDate] < [EndDate]");
                t.HasCheckConstraint("CK_Employment_Hours", "[HoursPerWeek] >= 0 AND [HoursPerWeek] <= 37");
            });
            // The same protection applies to sections and staff groups with employments.
            entity.HasOne(e => e.Section).WithMany(s => s.Employments)
                .HasForeignKey(e => e.SectionId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.StaffGroup).WithMany(s => s.Employments)
                .HasForeignKey(e => e.StaffGroupId).OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.UserId, e.StartDate, e.EndDate });
        });
    }
}
