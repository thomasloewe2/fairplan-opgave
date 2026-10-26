namespace Domain.Entities;

public class StaffGroup : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<Employment> Employments { get; set; } = new List<Employment>();
}
