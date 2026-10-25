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

            // Identity's default EmailIndex is not unique. The domain requires a unique email.
            // Populate NormalizedEmail consistently when creating/updating users.
            entity.HasIndex(u => u.NormalizedEmail).IsUnique().HasDatabaseName("EmailIndex");

            entity.HasMany(u => u.Employments)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Period>(entity =>
        {
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
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
            entity.HasOne(e => e.Section)
                .WithMany(s => s.Employments)
                .HasForeignKey(e => e.SectionId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.StaffGroup)
                .WithMany(s => s.Employments)
                .HasForeignKey(e => e.StaffGroupId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
