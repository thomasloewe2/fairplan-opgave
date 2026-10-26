# ADR 0003 – Frontend og brugeroplevelse (fase 3)

Jeg valgte **React Router i SPA-tilstand** med en fælles TypeScript-API-klient til .NET-backenden. Her gav klientsideindlæsning mere mening for mig end SSR eller server-side loaders: Backend ejer allerede API'et og forretningsreglerne.

Jeg valgte **TanStack Table** til søgning, sortering, filtrering og paginering frem for at implementere tabellogikken selv. Fordi biblioteket er *headless*, kunne jeg forme et konsekvent, responsivt dark theme med Tailwind/CSS. Jeg endte med afdæmpet navigation, tydelig kontrast mellem flader og færre dekorative borders og effekter.

Jeg overvejede at beholde **Afsnit og Personalegrupper som to paneler**, fordi tabellerne er smalle og kan ses uden ekstra klik. Jeg valgte dog faner med separate URL'er, ligesom under Adgangsstyring, for at følge opgavebeskrivelsen og sikre et konsekvent navigationsmønster. Til Perioder, Afsnit og Personalegrupper har jeg også tilføjet særskilte filtre ud over søgning. Nogle filtre kan virke overflødige med så få kolonner, men jeg prioriterede at opfylde kravene eksplicit og kan justere dem efter feedback.

Jeg prioriterede enkel betjening i formularerne: Afsnit har både en visuel HTML-farvevælger og et redigerbart HEX-felt; statusbeskeder kan lukkes og forsvinder efter ti sekunder. Jeg afprøvede også en specialbygget datovælger, men den flyttede formularens indhold og gav dårligere UX. Derfor gik jeg tilbage til browserens `input type="date"` med `color-scheme: dark`. Jeg accepterer, at popupens præcise farver og scrolling styres af browseren.

Frontend giver hurtig feltvalidering, men backend er fortsat ansvarlig for regler og fejl. Under integrationen blev det også tydeligt, hvor vigtigt det er at skelne mellem **API-adresse** (`VITE_API_BASE_URL`) og **CORS-origin**. Jeg har samlet API-kald og fejlhåndtering ét sted.

Jeg tilføjede GitHub Actions til frontend-typecheck/build og Playwright-tests mod frontend, API og SQL Server ved relevante Pull Requests. Det giver fælles, reproducerbar feedback og fanger fejl, som hverken typecheck eller isolerede servicetests nødvendigvis opdager. Der er CI, men ingen automatisk deployment.
