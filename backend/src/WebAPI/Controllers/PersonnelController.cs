using Application.Contracts.Personnel;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/personnel")]
public sealed class PersonnelController(PersonnelService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PersonnelResponse>>> GetForPeriod(
        [FromQuery] Guid periodId, CancellationToken ct) =>
        Ok(await service.GetForPeriodAsync(periodId, ct));
}
