# Deployment Guide: Local to Online Server

This guide provides steps to build and deploy the SI-SOTO application to an online server, ensuring the database is correctly migrated.

## 1. Prerequisites
- Node.js (v20+)
- PostgreSQL Database (Online)
- Environment Variables ready

## 2. Preparation
Ensure your `.env` file on the online server contains the production database URL:
```env
DATABASE_URL=postgres://user:password@hostname:port/database
JWT_SECRET=your_production_secret
```

## 3. Database Migration
To ensure the database schema is up-to-date on the online server, use the new production-ready migration script. This script is designed to run reliably in a server environment.

Run the following command on the online server:
```bash
npm run db:migrate:prod
```
> [!TIP]
> This command uses `lib/db/migrate.ts` which uses the application's native database connection. It ensures that the `drizzle/` migration files are applied exactly as they were generated locally.

## 4. Build for Production
Generate the optimized production bundle:
```bash
npm run build
```

## 5. Deployment Checklist
1. **Transfer Files**: Upload the following to your server:
   - `.next/` (The build output)
   - `public/` (Static assets)
   - `drizzle/` (Migration files - REQUIRED for `db:migrate:prod`)
   - `package.json` & `package-lock.json`
   - `next.config.ts`
   - `lib/db/migrate.ts` (For migrations)
2. **Install Dependencies**:
   ```bash
   npm install --production
   ```
3. **Apply Migrations**:
   ```bash
   npm run db:migrate:prod
   ```
4. **Start Application**:
   ```bash
   npm start
   ```

## 6. Troubleshooting
- **Database Connection**: Ensure the online server can reach the database (check firewall/security groups).
- **Environment Variables**: Double-check that all required variables are present in the online environment.
- **Migration Sync**: If you make schema changes locally, always run `npm run db:generate` before deploying to ensure the `drizzle/` folder has the latest SQL files.
