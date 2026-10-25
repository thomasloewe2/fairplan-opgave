# ADR 0001 – Domænemodel, lagdeling og afgrænsning

**Status:** Valgte designbeslutninger for FairPlan-opgaven

## Udgangspunkt og tilgang

Jeg begyndte med at gennemgå opgavebeskrivelsen og den udleverede full-stack-skabelon for at forstå både de funktionelle krav og den eksisterende arkitektur. Skabelonen giver et godt udgangspunkt med .NET, EF Core, ASP.NET Identity og en lagdelt projektstruktur. Den giver samtidig mulighed for at tilpasse designet til opgavens konkrete behov.

Mit mål med refaktoreringen har været at skabe en tydelig sammenhæng mellem domænemodellen, applikationens ansvar og de data, der udveksles med frontend. Jeg har derfor først modelleret domænets begreber og relationer og dernæst vurderet, hvordan de kan repræsenteres i den eksisterende arkitektur. Undervejs har jeg forsøgt at vælge løsninger, der er lette at forstå og vedligeholde, uden at introducere mere kompleksitet end opgaven kræver.

## Domænemodel og navngivning

Jeg har valgt at arbejde med fem centrale entities: `Period`, `Section`, `StaffGroup`, `Employment` og `User`.

Jeg anvender `Section` frem for `Department`, fordi opgavebeskrivelsen benytter begrebet *afsnit*, og fordi jeg ønsker et så præcist fælles sprog som muligt mellem krav og kode. Tilsvarende har jeg valgt `StaffGroup` frem for `DoctorType`, da *personalegruppe* beskriver rollen i vagtplanlægningen mere direkte. De oprindelige navne kunne også være anvendt med en klar definition; mit valg handler om konsekvent domæneterminologi.

Jeg har samlet relationerne til afsnit og personalegruppe på `Employment` frem for `User`. Det gør det muligt at repræsentere, at en bruger har forskellige ansættelser over tid – eksempelvis i forskellige afsnit eller med forskelligt timetal – uden at tidligere oplysninger overskrives.

`Period` er modelleret uafhængigt af `Employment`. Hvilke ansættelser der indgår i en valgt planlægningsperiode, afgøres ud fra datooverlap. Dermed undgår jeg en ekstra, vedvarende relation, som ville skulle holdes ajour.

Jeg har valgt `DateOnly` til datoerne, fordi opgaven arbejder med kalenderdage frem for klokkeslæt. Slutdatoen betragtes som inkluderet ved beregning af overlap. De beskrevne forretningsroller repræsenteres med `IsAdmin` og `IsPersonnel`, så en bruger kan have én eller begge roller.

## DTO'er og applikationskontrakter

Jeg har valgt at placere request- og responsemodeller i `Application/Contracts` frem for i Core. Min begrundelse er, at domæneentities beskriver forretningens begreber, mens disse modeller beskriver, hvilke oplysninger en use case modtager og returnerer. Adskillelsen gør det muligt at ændre eksempelvis en API-response uden nødvendigvis at ændre domæneklassen.

Jeg overvejede også et selvstændigt projekt, eksempelvis `FairPlan.Contracts` eller `Shared`. Det ville skabe en tydelig, selvstændig projektgrænse og være oplagt, hvis flere .NET-applikationer skulle dele kontrakterne. I denne opgave anvendes modellerne af WebAPI og Application, og jeg vurderer derfor, at en mappe i Application giver den ønskede opdeling med færre projekt- og referenceafhængigheder.

Jeg anvender særskilte request- og responsemodeller, så input kan afgrænses fra de data, som returneres. Det er især relevant for `User`, hvor interne Identity-egenskaber ikke skal eksponeres direkte gennem API'et.

## Mapping mellem entities og DTO'er

Jeg har valgt at placere mapping i `Application/Mapping`, fordi den konkrete mapping knytter domæneentities til Application-lagets kontrakter. Infrastrukturmapping, der alene vedrører persistens, kan fortsat høre til i Infrastructure.

Mappingen udføres med små, eksplicitte metoder. Et bibliotek som AutoMapper kunne mindske gentagelser i en større løsning, men her foretrækker jeg, at transformationerne er synlige og lette at følge. Ved oprettelse og redigering skal Application-servicen fortsat have ansvaret for, hvilke entity-egenskaber der må ændres, og hvilke regler der skal være opfyldt.

## Lagdeling og dataadgang

Jeg har valgt at videreføre skabelonens Onion Architecture som overordnet struktur:

- **Core** indeholder entities og repository-interfaces.
- **Application** samler use cases, forretningsregler, kontrakter og mapping.
- **Infrastructure** håndterer EF Core og den konkrete databaseadgang.
- **WebAPI** modtager HTTP-requests og formidler resultaterne.

I denne opgave ønsker jeg, at controllers primært håndterer HTTP, mens use cases og forretningsregler ligger i Application. Det giver et tydeligere sted at finde og teste eksempelvis reglerne om overlappende ansættelser og beskyttet sletning.

Jeg har valgt at arbejde videre med opgavespecifikke repository-interfaces. Jeg er samtidig opmærksom på, at EF Core's `DbContext` allerede tilbyder funktionalitet svarende til Repository og Unit of Work, og at direkte brug af DbContext i Application også kan være et fornuftigt design. Her har jeg prioriteret at bevare skabelonens lagdeling og holde dataadgang adskilt fra use cases, mens jeg undgår generiske abstraktioner uden et konkret behov.

## User og ASP.NET Identity

Jeg har valgt at bevare `User : IdentityUser<Guid>` og ASP.NET Identity, da det allerede indgår i skabelonens teknologiske fundament. Det giver mulighed for senere at udbygge løsningen med autentifikation uden at skulle udskifte brugergrundlaget.

Opgavebeskrivelsen stiller krav om at administrere brugere og deres roller, men ikke om at implementere login eller adgangskontrol til endpoints. Jeg har derfor valgt at holde autentifikation og autorisation uden for implementeringens scope.

Et alternativ ville være en almindelig `User`-entity uden Identity, som ville kræve færre tilknyttede tabeller og mindre konfiguration. Jeg har i stedet valgt at bevare den eksisterende mulighed, men uden at bruge tid på funktionalitet, der ikke er efterspurgt.

`IsAdmin` og `IsPersonnel` beskriver foreløbigt forretningsroller; de er ikke automatisk koblet til Identity's autorisationsroller. Hvis autentifikation og autorisation senere tilføjes, skal det besluttes, hvordan rolleoplysningerne håndteres konsekvent.

## Database og dataintegritet

Jeg har valgt SQL Server LocalDB med EF Core, fordi det allerede er understøttet af skabelonen og er tilstrækkeligt til lokal udvikling og demonstration. PostgreSQL eller en containerbaseret database ville gøre opsætningen mindre Windows-afhængig, men tilføjer infrastruktur, som ikke i sig selv bidrager til opgavens funktionelle krav.

Da der ikke er eksisterende data, som skal bevares, har jeg valgt at etablere en ny initial migration ud fra den tilpassede model frem for at videreføre den oprindelige migrationshistorik. Indledende eksempeldata skal kunne oprettes reproducerbart via seeding.

Jeg vil håndhæve forretningsregler såsom datooverlap, gyldige timetal, rollekrav og beskyttet sletning i backend. Samtidig anvender jeg databaseconstraints og beskyttede foreign keys som et ekstra lag til at sikre dataintegriteten. Målet er både korrekte data og forståelige fejlbeskeder til brugeren.

## Samlet refleksion

Mine valg er ikke tænkt som den eneste rigtige måde at strukturere applikationen på. Jeg har forsøgt at afveje genbrug af skabelonens eksisterende arkitektur mod ønsket om en domænemodel, der ligger tæt på kravene, og en kodebase, der er nem at arbejde videre i.

Jeg ser derfor diagrammerne og beslutningerne som et begrundet udgangspunkt. Hvis nye behov opstår under implementeringen, vil jeg hellere revurdere en konkret beslutning end fastholde den alene for at være konsekvent med det første design.
