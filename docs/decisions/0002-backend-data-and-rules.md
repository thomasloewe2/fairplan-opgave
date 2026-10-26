# ADR 0002 – Database, services og validering

**Status:** Valgt til backendimplementeringen

Jeg fortsætter med SQL Server LocalDB og EF Core, fordi skabelonen allerede understøtter dem, og fordi de fungerer godt til en lokal demonstration. Jeg opretter en ny migrationshistorik ud fra den valgte domænemodel, da jeg ikke behøver at bevare data fra skabelonen.

Jeg har valgt Application-services til CRUD og forretningsregler, mens repositories tager sig af EF Core-forespørgsler og persistens. Direkte brug af `DbContext` i Application kunne også være en enkel løsning, men opdelingen gør ansvaret tydeligt og gør reglerne lette at teste uden en database.

Jeg validerer datoer, timetal, roller og referencer, inden data gemmes. Databaseconstraints og restriktive foreign keys giver yderligere beskyttelse. Overlap mellem datointervaller kontrolleres i Application og med databaseforespørgsler. Ved samtidige skrivninger kan der stadig opstå en race condition, som i en større produktionsløsning bør håndteres med transaktioner eller stærkere databasegarantier.

Jeg benytter udviklingsdata med stabile ID'er, så de samme eksempler kan oprettes gentagne gange uden dubletter. Databaseopdatering og seeding sker kun ved opstart i Development. Login er fortsat uden for opgavens scope.
