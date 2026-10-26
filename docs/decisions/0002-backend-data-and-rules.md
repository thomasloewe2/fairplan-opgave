# ADR 0002 – Database, backend og forretningsregler (fase 2)

Jeg valgte at fortsætte med **SQL Server LocalDB og EF Core 8** fra skabelonen. SQLite ville gøre lokal opstart mere platformuafhængig, men vi havde allerede en fungerende SQL Server-integration, og jeg ville hellere demonstrere arbejdet med migrations, relationer og constraints end vedligeholde to databaseproviders. Da skabelonens data ikke skulle bevares, oprettede jeg en ny initial migration til den tilpassede model.

I Development kører `MigrateAsync()` og derefter seeding automatisk ved backendopstart. Seed-data har faste ID'er og indsættes kun, hvis posterne mangler. Det gør en frisk lokal database nem at etablere og genstarte. Jeg har fravalgt automatisk migration i Production, hvor schemaændringer bør ske kontrolleret.

Jeg lagde CRUD og validering i **Application-services** og EF Core-forespørgsler i repositories. Her valideres bl.a. datoer, timetal (0–37), brugerroller, referencer og overlap: perioder må ikke overlappe, og én bruger må ikke have overlappende ansættelser. Slutdatoer tæller med. Brugere med ansættelser kan ikke slettes eller miste Personale-rollen, og afsnit/personalegrupper med ansættelser kan heller ikke slettes.

Jeg supplerede servicereglerne med en unik indeksregel for normaliseret e-mail, datochecks, timetalsconstraint og restriktive foreign keys. Det beskytter data, selvom en service skulle omgås. Fejl sendes som forståelige HTTP-svar (400, 404 og 409).

Jeg valgte automatiserede servicetests samt en browserintegrationstest mod rigtig SQL Server frem for kun at stole på manuelle Swagger-kald. Én afgrænsning er, at overlapkontrollen ikke alene garanterer mod samtidige, konkurrerende skrivninger; det ville kræve stærkere transaktionshåndtering i en produktionsløsning.
