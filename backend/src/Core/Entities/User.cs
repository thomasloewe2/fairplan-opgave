using Microsoft.AspNetCore.Identity;

namespace Domain.Entities;

// Identity is retained from the supplied template. Authentication is out of scope.
public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    // Business-role flags; they are not automatically ASP.NET Identity roles.
    public bool IsAdmin { get; set; }
    public bool IsPersonnel { get; set; }

    public ICollection<Employment> Employments { get; set; } = new List<Employment>();
}
