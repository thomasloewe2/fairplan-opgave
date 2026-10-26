# ADR 0003 – Frontend og brugergrænseflade

Jeg har valgt React Router med klientsideindlæsning, fordi dette er et administrationsinterface, hvor brugerhandlingerne afhænger af REST API'et. Dermed undgår jeg at indføre server-side dataloaders i React ved siden af .NET-backenden.

Til tabellerne bruger jeg TanStack Table. Det giver søgning, sortering, filtrering og paginering med ensartet adfærd på siderne, samtidig med at jeg selv kan forme det visuelle udtryk med Tailwind/CSS. Alternativet var at implementere tabelfunktionerne selv, men det ville give mere vedligeholdelsesarbejde for de samme krav.

Til afsnitsfarver har jeg valgt browserens indbyggede `input type="color"` sammen med et tekstfelt til HEX. Det undgår en ekstra afhængighed, men lader brugeren både vælge farven visuelt og indtaste den præcist.

Til datoer bruger jeg browserens indbyggede `input type="date"` med `color-scheme: dark`. Jeg havde først forsøgt en specialbygget kalender, men den skubbede til formularens øvrige indhold. Browserens eget overlay giver et enklere flow uden den forskydning; udseende og scrolling varierer dog lidt med browser og styres ikke fuldt ud af CSS.

Formularer laver enkel klientvalidering for hurtig feedback. Backend forbliver ansvarlig for forretningsreglerne, og dens valideringsbeskeder vises i grænsefladen.

Denne løsning prioriterer et ensartet UI og et begrænset antal afhængigheder frem for et større, fuldt UI-komponentbibliotek.
