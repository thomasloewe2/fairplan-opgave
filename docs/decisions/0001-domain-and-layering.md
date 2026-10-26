# ADR 0001 – Domænemodel og lagdeling (fase 1)

Jeg begyndte med at gennemgå opgavebeskrivelsen og den udleverede skabelon. Mit mål var at fastholde en genkendelig arkitektur, men få domænemodellen og navngivningen til at afspejle kravene tydeligt.

## Domænet

Jeg valgte `Period`, `Section`, `StaffGroup`, `Employment` og `User` som centrale entities. Navnene `Section` og `StaffGroup` ligger tættere på *afsnit* og *personalegruppe* i opgaven end alternativer som `Department` og `DoctorType`.

En brugers afsnit, personalegruppe, timetal og ansættelsesdatoer ligger på `Employment` frem for `User`. Så kan en bruger skifte ansættelsesforhold over tid, uden at historikken overskrives. Jeg valgte samtidig at holde `Period` uafhængig af ansættelser: Personaleoversigten beregnes ud fra overlappende datoer, ikke en ekstra relation, der skal vedligeholdes. `DateOnly` passer til kalenderdage; slutdatoen indgår i overlapberegningen.

## Ansvar og afgrænsning

Jeg beholdt skabelonens Onion Architecture: **Core** til domæne og repository-interfaces, **Application** til use cases og regler, **Infrastructure** til EF Core og **WebAPI** til HTTP. Det skiller dataadgang fra forretningslogik, selvom direkte brug af `DbContext` i Application også kunne have været en enklere løsning.

Jeg placerede request-/response-DTO'er i `Application/Contracts` frem for Core eller et særskilt Shared-projekt. Med få projekter giver det færre afhængigheder, mens API'et stadig undgår at eksponere entities direkte. Mappingen er eksplicit i Application frem for at tilføje AutoMapper.

Jeg bevarede `User : IdentityUser<Guid>`, fordi Identity allerede var en del af skabelonen, og brugergrundlaget dermed kan udbygges senere. Jeg har dog **tolket** opgavens brugerkrav som administration af brugere og deres forretningsroller, ikke som et krav om login. `IsAdmin` og `IsPersonnel` er derfor almindelige domænefelter og ikke Identity-autorisationsroller.

Samlet har jeg prioriteret præcise begreber, tydelige ansvarsområder og så få nye abstraktioner som nødvendigt.
