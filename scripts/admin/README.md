## Admin scripts (DB-connected)

These scripts use Prisma and talk directly to your database via `DATABASE_URL`.

### Setup

- Ensure `.env.local` contains `DATABASE_URL`
- Run `npm install` (already in this project)

### Seed sample data (products + gyms)

```bash
node scripts/admin/seed.mjs
```

### Add tokens to a user by email

```bash
node scripts/admin/add-tokens.mjs user@example.com 50
```

