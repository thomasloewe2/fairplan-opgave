# ADR 0001 – Domænemodel, lagdeling og afgrænsning

**Status:** Valgt til hjemmeopgaven (fase 1). Beslutningerne kan revurderes i samtalen med Computation.

## Kontekst

Den udleverede skabelon indeholder ASP.NET Core, EF Core, ASP.NET Identity og React, men den oprindelige backendmodel stemmer ikke overens med opgavebeskrivelsen. Særligt ligger Department og DoctorType på User i stedet for ansættelsen; EmploymentPeriod mangler afsnit, personalegruppe og timer; Permission modellerer CRUD-rettigheder i stedet for de to forretningsroller. Flere controllers anvender DbContext direkte, mens services og repositories er `NotImplementedException`-stubs.

## Beslutning: navne og domænerelationer

Vi bruger `Period`, `Section`, `StaffGroup`, `Employment` og `User`.

- `Department` ændres til `Section` for at afspejle opgavens begreb **Afsnit**; det er en domænesproglig beslutning, ikke et frameworkkrav.
- `DoctorType` ændres til `StaffGroup`; gruppe er ikke nødvendigvis en lægespecialitet.
- `Employment` forbinder User, Section og StaffGroup og indeholder arbejdstid og start/slutdato. Det gør historiske ansættelser mulige.
- `Period` har ingen foreign key til Employment; personaleudtræk afhænger af interval-overlap.
- Kalenderdatoer er `DateOnly` i stedet for `DateTime`. Begge slutdatoer er inklusive for overlaplogikken.
- `User` har to uafhængige forretningsflag: `IsAdmin` og `IsPersonnel`.

**Trade-off:** Omdøbninger koster refaktorering af eksisterende kode, men mindsker begrebsforvirring. Domænet er en forenkling af et reelt hospitalsvagtplanssystem.

## Beslutning: Application/Contracts frem for Core/DTO eller et nyt Shared-projekt

Request/response-modeller placeres i `Application/Contracts` efter funktionalitet, og eksplicit outputmapping placeres i `Application/Mapping`.

**Hvorfor ikke Core/DTO?** Domænelaget bør beskrive forretningens entities og abstraktioner og ikke kende API-/use-case-specifikke input/outputformer.

**Alternativ: FairPlan.Contracts eller Shared:** Et selvstændigt class library giver en hårdere genbrugsgrænse mellem flere .NET-klienter, men indfører et ekstra projekt og referencehåndtering. Her bruges kontrakterne kun af Application og WebAPI. Et separat projekt giver derfor ikke tilstrækkelig værdi i opgavens omfang.

**Alternativ: Infrastructure/Mapping:** Infrastrukturmapping til databasen hører hjemme dér, men transportmodeller til Application-kontrakter gør ikke. Explicit mappings er gennemskuelige og kræver ikke AutoMapper.

## Beslutning: bevar Identity, men implementér ikke login

`User` arver fortsat fra `IdentityUser<Guid>`, fordi skabelonen allerede anvender Identity. Opgavebeskrivelsen kræver administration af brugere/roller, men nævner ikke login, adgangskoder eller autorisation. Login-controlleren er derfor ikke del af vores API-scope.

**Alternativ:** Fjerne Identity og bruge en simpel User-entity. Det ville reducere kompleksitet og tabeller. Vi bevarer det for nu og tager afgrænsningen op med virksomheden.

**Vigtig nuance:** IsAdmin/IsPersonnel er forretningsroller og ikke synkroniseret med ASP.NET IdentityRole. En eventuel senere autentifikationsløsning skal vælge én autoritativ rollemodel.

## Beslutning: Onion Architecture uden unødvendige stubs

- **Core:** Entities og repository-interfaces.
- **Application:** Use cases, input/output contracts og mapping.
- **Infrastructure:** EF Core, DbContext og senere konkrete repositories.
- **WebAPI:** Controllers og composition root; uden domæneregler.

De oprindelige ufærdige services og repositories samt controllers, der refererede til de gamle entities, fjernes i denne branch. Vi genskaber endpoints som tynde controllers med Application-services, når fase 2 implementeres. Det er et bevidst mellemtrin og ingen påstand om færdig API-funktionalitet.

**Alternativ:** Bruge DbContext direkte fra Application og undlade generiske repositories. EF Core fungerer allerede som repository/unit of work. Vi har valgt små opgavespecifikke interfaces, fordi skabelonen introducerer dette lag, og fordi det muliggør en tydelig diskussion om afhængigheder og tests. Vi vil undgå unødvendige abstraktioner.

## Database og næste trin

Vi beholder SQL Server LocalDB (Windows), genopretter migrationer fra nul (ingen data skal bevares) og laver idempotent seed-data. Fase 1 tilpasser DbContext til, at projektet kan kompileres, men den gamle migration er endnu ikke nulstillet. Ingen nye databaseoprettelser bør forsøges med den gamle migration.

Den endelige backend skal håndhæve periodeoverlap, ansættelsesoverlap pr. person, e-mailunikhed, rollekrav, dato- og timeintervaller og beskyttet sletning. Database-FK'er er sat til Restrict som et første sikkerhedsnet; applikationsvalidering og automatiserede tests følger i fase 2.

## Spørgsmål til dialogen med Computation

- Ønsker virksomheden at bruge de eksisterende Identity-tabeller, selvom login ikke kræves?
- Er det væsentligt at kunne køre løsningen uden Windows/LocalDB?
- Vil et separat Contracts-projekt give værdi i deres øvrige systemer?
- Hvor meget lagdeling er hensigtsmæssig i forhold til løsningens størrelse?
