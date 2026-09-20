# OL Backend

NestJS + Sequelize (PostgreSQL) API for the OL template/marketplace platform. See `../structure.md` for the product spec.

## Setup

```bash
cp .env.example .env   # fill in DATABASE_URL, GOOGLE_CLIENT_ID, and (optionally) ANTHROPIC_API_KEY
npm install
npm run seed            # creates 4 demo templates + a demo admin account
npm run start:dev       # http://localhost:3000/v1
```

The demo admin credentials are printed by `npm run seed` (phone `+998900000000`, password `ChangeMe123!` unless already seeded).

Without `ANTHROPIC_API_KEY` set, `/ai/templates/:id/customize` and `/regenerate` fall back to a deterministic mock generator so the flow still works end-to-end.

## Notes

- Sequelize runs with `synchronize: true` in dev — models are the source of truth, no migration files.
- Every template is rendered by one of 4 fixed frontend layouts (`landing`/`portfolio`/`store`/`course`), selected by `Template.templateKey`.
- Payments is a demo gateway: `POST /payments/checkout` resolves as `success` synchronously; no real provider is wired up.
