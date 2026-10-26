using Application.Contracts.Sections;
using Domain.Entities;

namespace Application.Mapping;

public static class SectionMapping
{
    public static SectionResponse ToResponse(this Section section) =>
        new(section.Id, section.Name, section.ColorHex);
}
