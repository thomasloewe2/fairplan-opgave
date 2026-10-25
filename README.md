# FairPlan – praktikopgave

Dette repository er et fork af Computations full-stack-skabelon til en hjemmeopgave om administration af planlægningsperioder, afsnit, personalegrupper, brugere og ansættelser.

## Status: fase 1 – arkitekturrefaktorering

Branchen `refactor/domain-model` indeholder første refaktorering:
- Domæneentities og relationer er tilpasset opgavebeskrivelsen.
- ASP.NET Identity og `User : IdentityUser<Guid>` er bevaret; login/autentifikation er uden for opgavens scope.
- Transportmodeller ligger i `Application/Contracts`, med separat request/response.
- Entity-til-response mapping ligger i `Application/Mapping`.
- Ufærdige services, repositories og inkompatible template-controllers er fjernet frem for at efterlade `NotImplementedException`.
- Core definerer repository-interfaces; concrete implementations og nye REST-endpoints kommer i fase 2.

**Vigtigt:** Dette er et mellemtrin, ikke en færdig applikation. Der er endnu ingen FairPlan CRUD-endpoints i denne branch, og den gamle initial migration afspejler ikke den nye model. Anvend ikke eksisterende migration eller start med at oprette en database mod den. Migration, seeding, services, endpoints, frontend og tests færdiggøres i senere trin.

## Teknologistak

- Backend: ASP.NET Core / .NET 8, EF Core 8, ASP.NET Identity
- Database: SQL Server LocalDB på Windows
- Frontend: React, TypeScript, React Router 7, Tailwind CSS

## Lokal klargøring

Forudsætninger: .NET 8 SDK, SQL Server LocalDB (Windows) og Node.js 20+.

```bash
dotnet restore backend/backend.sln
dotnet build backend/backend.sln
dotnet test backend/backend.sln
```

WebAPI-start (i et terminalvindue):

```bash
dotnet run --project backend/src/WebAPI/WebAPI.csproj
```

Frontend (i et andet terminalvindue):

```bash
cd frontend
npm ci
npm run dev
```

Den nuværende frontend er stadig skabelonens velkomstside. Forbindelse til det fremtidige API følger i fase 3. Den aktuelle LocalDB-connection string ligger i `backend/src/WebAPI/appsettings.json`.

## Arkitektur og beslutninger

Læs [beslutningsnotatet](docs/decisions/0001-domain-and-layering.md) om AS-IS, TO-BE, DTO-placering, ASP.NET Identity og bevidste afgrænsninger.

De eksisterende migrationer skal nulstilles, og en ny initial migration genereres, når EF Core-konfigurationen er færdiggjort i fase 2. Vi bevarer ikke data fra den oprindelige template.
