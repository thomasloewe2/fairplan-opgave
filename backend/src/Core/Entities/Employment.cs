namespace Domain.Entities;

public class Employment : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid SectionId { get; set; }
    public Section Section { get; set; } = null!;

    public Guid StaffGroupId { get; set; }
    public StaffGroup StaffGroup { get; set; } = null!;

    public int HoursPerWeek { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
