# BWitek.dev

Modern full-stack portfolio and blog website built with cutting-edge web technologies. Features a complete content management system, newsletter integration, social sharing, and multilingual support.

**[Visit the website](https://bwitek.dev)**

## Tech Stack

### Runtime & Build
[![Bun](https://img.shields.io/badge/Bun-1.2-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.8-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.7-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

### Backend
[![Hono](https://img.shields.io/badge/Hono-4.12-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![tRPC](https://img.shields.io/badge/tRPC-11.12-398CCB?style=for-the-badge&logo=trpc&logoColor=white)](https://trpc.io)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.44-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)

### Features & Integrations
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.5-FF6B6B?style=for-the-badge)](https://better-auth.com)
[![Brevo](https://img.shields.io/badge/Brevo-Newsletter-0052CC?style=for-the-badge)](https://www.brevo.com)
[![TipTap](https://img.shields.io/badge/TipTap-2.27-1A1A1A?style=for-the-badge)](https://tiptap.dev)
[![next-intl](https://img.shields.io/badge/next--intl-4.8-4CAF50?style=for-the-badge)](https://next-intl-docs.vercel.app)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)

## Prerequisites

- **Bun** 1.2+ (Runtime & Package Manager)
- **MySQL** 8.0+ (Database)
- **PM2** (Production process manager)

## Development

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env

# Start all applications
bun dev

# Start only the frontend
bun dev:web

# Start only the backend API
bun dev:server

# Open database studio
bun db:studio
```

## Production

```bash
# Build all applications
bun build

# Start with PM2
pm2 start prod.config.cjs

# Check status
pm2 status
```

## Testing

```bash
# Run all tests
bun run test

# Run web tests only
bun run test:web

# Watch mode
cd apps/web && bun run test:watch
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `bun dev` | Start development servers |
| `bun build` | Build all applications |
| `bun run test` | Run tests (vitest) |
| `bun check-types` | TypeScript type checking |
| `bun db:push` | Apply schema changes to database |
| `bun db:studio` | Open Drizzle Studio |
| `bun db:generate` | Generate database migrations |
| `bun db:migrate` | Run database migrations |

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Boguslaw Witek**
