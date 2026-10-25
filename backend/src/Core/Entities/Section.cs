namespace Domain.Entities;

public class Section : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;

    public ICollection<Employment> Employments { get; set; } = new List<Employment>();
}
