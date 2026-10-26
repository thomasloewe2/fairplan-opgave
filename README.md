# FairPlan – administration af vagtplansdata

Full-stack webapplikation til administration af perioder, afsnit, personalegrupper, brugere og ansættelser i forbindelse med vagtplanlægning for hospitalslæger.

Projektet er udviklet som en praktikopgave til [Computation ApS / FairPlan](https://fairplan.dk/) med udgangspunkt i en [udleveret full-stack-skabelon](https://github.com/Frederik-Hoegh-Christensen/full_stack_template).

## Funktionalitet

- **Perioder:** Opret, rediger og slet planlægningsperioder. Overlappende perioder afvises.
- **Organisering:** Administrer afsnit med farvekoder og personalegrupper. Enheder med tilknyttede ansættelser kan ikke slettes.
- **Adgangsstyring:** Administrer brugere med rollerne Admin og/eller Personale samt ansættelser med afsnit, personalegruppe, arbejdstid og datoer.
- **Personale:** Vis et skrivebeskyttet personaleoverblik for en valgt periode, baseret på overlappende ansættelser.

Tabellerne understøtter den søgning, sortering og filtrering, der er specificeret i opgaven. Forretningsregler valideres i backend, og fejl præsenteres i brugergrænsefladen.

## Teknologier

| Område | Teknologi |
| --- | --- |
| Frontend | React, TypeScript, React Router, TanStack Table, Tailwind CSS |
| Backend | ASP.NET Core Web API (.NET 8) |
| Dataadgang | Entity Framework Core 8 |
| Database | SQL Server LocalDB |
| Brugerdata | ASP.NET Identity |

Backend er organiseret efter principperne i Onion Architecture:

- `Core` – domæneentities og repository-interfaces
- `Application` – use cases, forretningsregler, contracts og mapping
- `Infrastructure` – EF Core og databaseadgang
- `WebAPI` – REST-endpoints og dependency injection

## Kom godt i gang

**Forudsætninger:** Windows med SQL Server LocalDB, .NET 8 SDK og Node.js 20 eller nyere.

1. Klon repository:

   ```bash
   git clone https://github.com/thomasloewe2/fairplan-opgave.git
   cd fairplan-opgave
   ```

2. Start backend fra repositorys rodmappe:

   ```bash
   dotnet restore backend/backend.sln
   dotnet run --project backend/src/WebAPI/WebAPI.csproj --launch-profile http
   ```

   API og Swagger: [http://localhost:5166/swagger](http://localhost:5166/swagger).

3. Start frontend i en separat terminal:

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Frontend: [http://localhost:5173](http://localhost:5173).

Connection string til LocalDB findes i `backend/src/WebAPI/appsettings.json` og kan ændres efter behov. Ved opstart i Development anvendes EF Core-migrations, og databasen initialiseres med eksempeldata.

## Tests

Kør backendens automatiserede tests fra repositorys rodmappe:

```bash
dotnet test backend/backend.sln
```

Kør frontendens typekontrol og produktionsbuild:

```bash
cd frontend
npm run typecheck
npm run build
```

Browserintegrationstests med Playwright kan køres mod en særskilt testdatabase, når API'et kører (se [frontendens vejledning](frontend/README.md)).

## Projektstruktur

```text
backend/
  src/
    Core/
    Application/
    Infrastructure/
    WebAPI/
  Tests/
frontend/
  app/
docs/
  decisions/
```

## Designbeslutninger og afgrænsning

Væsentlige arkitekturvalg og alternativer er beskrevet i [ADR 0001](docs/decisions/0001-domain-and-layering.md), [ADR 0002](docs/decisions/0002-backend-data-and-rules.md) og [ADR 0003](docs/decisions/0003-frontend-ui.md).

ASP.NET Identity er bevaret fra skabelonen, men login, autentifikation og autorisation er ikke en del af opgavens funktionelle scope. Admin og Personale er forretningsroller på brugerens profil.
