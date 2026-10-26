# ADR 0003 – Frontend og brugergrænseflade

Jeg har valgt React Router med klientsideindlæsning, fordi dette er et administrationsinterface, hvor brugerhandlingerne afhænger af REST API'et. Dermed undgår jeg at indføre server-side dataloaders i React ved siden af .NET-backenden.

Til tabellerne bruger jeg TanStack Table. Det giver søgning, sortering, filtrering og paginering med ensartet adfærd på siderne, samtidig med at jeg selv kan forme det visuelle udtryk med Tailwind/CSS. Alternativet var at implementere tabelfunktionerne selv, men det ville give mere vedligeholdelsesarbejde for de samme krav.

Til afsnitsfarver har jeg valgt browserens indbyggede `input type="color"` sammen med et tekstfelt til HEX. Det undgår en ekstra afhængighed, men lader brugeren både vælge farven visuelt og indtaste den præcist.

Til datoer bruger jeg en enkel kalenderkomponent med faste måned- og årsvælgere. Browserens indbyggede datovælger kunne ikke styles konsekvent og havde uhensigtsmæssig scrolling. Brugeren kan også indtaste datoer i dansk format.

Formularer laver enkel klientvalidering for hurtig feedback. Backend forbliver ansvarlig for forretningsreglerne, og dens valideringsbeskeder vises i grænsefladen.

Denne løsning prioriterer et ensartet UI og et begrænset antal afhængigheder frem for et større, fuldt UI-komponentbibliotek.
