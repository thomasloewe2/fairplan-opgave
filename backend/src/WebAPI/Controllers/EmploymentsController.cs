using Application.Contracts.Employments;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EmploymentsController(EmploymentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmploymentResponse>>> GetAll(CancellationToken ct) =>
        Ok(await service.ListAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmploymentResponse>> GetById(Guid id, CancellationToken ct) =>
        Ok(await service.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<EmploymentResponse>> Create(
        [FromBody] CreateEmploymentRequest request, CancellationToken ct)
    {
        var created = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmploymentResponse>> Update(
        Guid id, [FromBody] UpdateEmploymentRequest request, CancellationToken ct) =>
        Ok(await service.UpdateAsync(id, request, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await service.DeleteAsync(id, ct);
        return NoContent();
    }
}
