using Application.Contracts.Sections;
using Application.Errors;
using Application.Mapping;
using Application.Validation;
using Domain.Entities;
using Domain.Interfaces.Repositories;

namespace Application.Services;

public sealed class SectionService(ISectionRepository repository)
{
    public async Task<IReadOnlyList<SectionResponse>> ListAsync(CancellationToken ct = default) =>
        (await repository.GetAllAsync(ct)).Select(x => x.ToResponse()).ToArray();

    public async Task<SectionResponse> GetAsync(Guid id, CancellationToken ct = default) =>
        (await FindAsync(id, ct)).ToResponse();

    public async Task<SectionResponse> CreateAsync(CreateSectionRequest request, CancellationToken ct = default)
    {
        var section = new Section { Name = Rules.Name(request.Name, "Afsnittets navn"), ColorHex = Rules.Color(request.ColorHex) };
        await repository.AddAsync(section, ct);
        return section.ToResponse();
    }

    public async Task<SectionResponse> UpdateAsync(Guid id, UpdateSectionRequest request, CancellationToken ct = default)
    {
        var section = await FindAsync(id, ct);
        section.Name = Rules.Name(request.Name, "Afsnittets navn");
        section.ColorHex = Rules.Color(request.ColorHex);
        await repository.UpdateAsync(section, ct);
        return section.ToResponse();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var section = await FindAsync(id, ct);
        if (await repository.HasEmploymentsAsync(id, ct))
            throw ApplicationException.Conflict("Afsnittet kan ikke slettes, da det har tilknyttede ansættelser.");
        await repository.DeleteAsync(section, ct);
    }

    private async Task<Section> FindAsync(Guid id, CancellationToken ct) =>
        await repository.GetByIdAsync(id, ct) ?? throw ApplicationException.Missing("Afsnittet blev ikke fundet.");
}
