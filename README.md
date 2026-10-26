# FairPlan – administration af vagtplansdata

En full-stack webapplikation til administration af planlægningsperioder, afsnit, personalegrupper, brugere og ansættelser i forbindelse med vagtplanlægning på hospitaler.

Projektet er udviklet som praktikopgave til [Computation ApS / FairPlan](https://fairplan.dk/) med udgangspunkt i en [udleveret full-stack-skabelon](https://github.com/Frederik-Hoegh-Christensen/full_stack_template).

## Funktionalitet

- **Perioder:** Opret, rediger og slet perioder. Startdato skal ligge før slutdato, og perioder må ikke overlappe.
- **Organisering:** Administrer afsnit med visuel farvevælger og redigerbar HEX-kode samt personalegrupper. Enheder med tilknyttede ansættelser kan ikke slettes.
- **Adgangsstyring:** Administrer brugere med rollerne Admin og/eller Personale samt ansættelser med afsnit, personalegruppe, datoer og 0–37 timer pr. uge. E-mail skal være unik; en bruger skal have mindst én rolle. Ansættelser for samme bruger må ikke overlappe, og brugere med ansættelser kan ikke slettes eller miste Personale-rollen.
- **Personale:** Skrivebeskyttet oversigt over ansættelser, der overlapper den valgte periode, inklusive afsnitsfarver.

Tabellerne understøtter søgning, sortering, filtrering og paginering. Frontenden har et responsivt mørkt tema, bekræftelse ved sletning, browserens indbyggede datovælger og statusbeskeder med nedtælling og luk-knap. Backend håndhæver forretningsregler og returnerer forståelige fejlbeskeder.

## Teknologier og struktur

| Del | Teknologi |
| --- | --- |
| Frontend | React 19, TypeScript, React Router 7 (SPA), Vite 6, TanStack Table og Tailwind CSS 4 |
| Backend | ASP.NET Core Web API (.NET 8), Swagger |
| Dataadgang | EF Core 8, migrations og repositories |
| Database | SQL Server LocalDB (lokalt); SQL Server 2022 i CI-integrationstest |
| Brugermodel | ASP.NET Identity, `IdentityUser<Guid>` |
| Test og CI | xUnit, Playwright og GitHub Actions |

Backend bygger videre på skabelonens Onion Architecture:

- `backend/src/Core` – entities og repository-interfaces
- `backend/src/Application` – services, forretningsregler, DTO'er og mapping
- `backend/src/Infrastructure` – EF Core, repositories, migrations og seeding
- `backend/src/WebAPI` – REST-controllere, fejlhåndtering og dependency injection
- `frontend/app` – sider, formularer, tabeller og API-klient

## Kom godt i gang

**Forudsætninger:** Windows med **SQL Server LocalDB**, **.NET 8 SDK** og **Node.js 20+** (CI bruger Node.js 22). Standardopsætningen anvender Windows-godkendelse mod LocalDB.

**1. Klon repositoryet:**

```bash
git clone https://github.com/thomasloewe2/fairplan-opgave.git
cd fairplan-opgave
```

**2. Start backend** fra repositoryets rodmappe:

```bash
dotnet restore backend/backend.sln
dotnet run --project backend/src/WebAPI/WebAPI.csproj --launch-profile http
```

API: `http://localhost:5166` · Swagger: [http://localhost:5166/swagger](http://localhost:5166/swagger).

Når backend starter med launch-profilen `http` eller `https`, anvendes miljøet **Development**. Her udfører EF Core automatisk eksisterende migrations (`MigrateAsync`) og derefter `SeedData.InitializeAsync`. På en frisk LocalDB oprettes databasen `FairPlanDb` med eksempelperioder, afsnit, personalegrupper, brugere og ansættelser. Seedning ved efterfølgende opstarter giver ikke dubletter af disse eksempelposter.

Connection string findes i `backend/src/WebAPI/appsettings.json` og kan tilsidesættes via konfiguration, fx miljøvariablen `ConnectionStrings__DefaultConnection`. Nye ændringer i EF-modellen kræver fortsat, at der **oprettes en migration**; automatisk opstart anvender kun migrations, som allerede findes. Migrations og seeding køres **ikke automatisk i Production**.

**3. Start frontend** i en anden terminal fra repositoryets rodmappe:

```bash
cd frontend
npm ci
npm run dev
```

Åbn [http://localhost:5173](http://localhost:5173). Frontenden bruger som standard API-adressen `http://localhost:5166`.

**Alternativt med HTTPS:** Start backend med `--launch-profile https` (Swagger på `https://localhost:7170/swagger`), og opret `frontend/.env.local` med:

```env
VITE_API_BASE_URL=https://localhost:7170
```

Genstart frontend efter ændringen. Lokal HTTPS kan kræve, at udviklingscertifikatet godkendes (`dotnet dev-certs https --trust`). Filen `.env.local` er gitignoreret og skal ikke committes. CORS-politikken i WebAPI tillader bl.a. frontend-origin `http://localhost:5173`.

## Tests og CI

Fra repositoryets rodmappe:

```bash
dotnet test backend/backend.sln
```

Fra `frontend`-mappen:

```bash
npm run typecheck
npm run build
```

Browserintegrationstests ligger i `frontend/tests/app.spec.ts` og anvender Playwright. De forudsætter et kørende API, en frontend og **en særskilt testdatabase**, da testene opretter og sletter data:

```bash
npx playwright install chromium
npm run test:e2e
```

GitHub Actions indeholder tre workflows:

- **Backend build and tests:** .NET-build og tests ved relevante pushes til `main`/`feature/**` og Pull Requests til `main`.
- **Frontend build:** npm-installation, TypeScript-typecheck og produktionsbuild ved relevante pushes og Pull Requests.
- **Frontend browser integration:** Playwright mod API og SQL Server 2022-container ved relevante Pull Requests til `main` eller manuel start.

Workflowsene giver CI-kontrol; projektet har ikke automatisk deployment.

## Designbeslutninger og afgrænsning

Mine vigtigste valg og fravalg er beskrevet i [ADR 0001 – Domænemodel og lagdeling](docs/decisions/0001-domain-and-layering.md), [ADR 0002 – Database og backend](docs/decisions/0002-backend-data-and-rules.md) og [ADR 0003 – Frontend og UX](docs/decisions/0003-frontend-ui.md).

Jeg har valgt at bevare ASP.NET Identity fra skabelonen, fordi det giver et kendt brugergrundlag og mulighed for senere udvidelse. **Min vurdering af opgavebeskrivelsen** er, at den primært efterspørger administration af brugere og deres roller frem for et egentligt login- og adgangskontrolflow. Jeg har derfor prioriteret den funktionelle administration og ikke implementeret autentifikation eller autorisation af API-endpoints. `IsAdmin` og `IsPersonnel` er forretningsroller på brugerprofilen, ikke Identity-roller; den afgrænsning ville jeg genoverveje ved nye krav.
