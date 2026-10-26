# FairPlan – frontend

React 19, TypeScript, React Router 7 (SPA), TanStack Table og Tailwind CSS.

## Start lokalt

Kør .NET API'et på `http://localhost:5166` (med `--launch-profile http`), og start derefter frontenden:

```bash
npm ci
npm run dev
```

Åbn `http://localhost:5173`.

API-adressen kan tilsidesættes med `VITE_API_BASE_URL` i `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:5166
```

Brug en adresse, der er tilgængelig fra browseren. Den eksisterende backend tillader `http://localhost:5173` via CORS.

## Kvalitetskontrol

```bash
npm run typecheck
npm run build
```

## Funktioner

- Perioder: CRUD og søgbar/sorterbar oversigt
- Organisering: Afsnit med farvevælger og redigerbar HEX-kode; personalegrupper
- Adgangsstyring: Brugere og ansættelser med formularvalidering
- Personale: Skrivebeskyttet oversigt for en valgt periode
- Genbrugelige tabeller med søgning, filtrering, sortering og paginering
- Backendvalideringsfejl vises i formularerne

Login er uden for denne hjemmeopgaves scope.
