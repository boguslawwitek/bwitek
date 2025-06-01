# BWitek.dev

Modern full-stack portfolio and blog website built with cutting-edge web technologies. Features a complete content management system, newsletter integration, social sharing, and multilingual support.

🌐 **[Visit the website](https://bwitek.dev)**

## Tech Stack

### Runtime & Build
[![Bun](https://img.shields.io/badge/Bun-1.2-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)

### Frontend
[![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-0.7-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)

### Backend
[![Hono](https://img.shields.io/badge/Hono-4.7-E36002?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![tRPC](https://img.shields.io/badge/tRPC-11.1-398CCB?style=for-the-badge&logo=trpc&logoColor=white)](https://trpc.io)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.43-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)

### Features & Integrations
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.2-FF6B6B?style=for-the-badge)](https://better-auth.com)
[![Brevo](https://img.shields.io/badge/Brevo-Newsletter-0052CC?style=for-the-badge)](https://www.brevo.com)
[![TipTap](https://img.shields.io/badge/TipTap-2.12-1A1A1A?style=for-the-badge)](https://tiptap.dev)
[![next-intl](https://img.shields.io/badge/next--intl-4.1-4CAF50?style=for-the-badge)](https://next-intl-docs.vercel.app)

## Prerequisites

- **Bun** 1.2+ (Runtime & Package Manager)
- **MySQL** 8.0+ (Database)

## Development

```bash
# Start all applications (web on :3001, server on :3000)
bun dev

# Start only the frontend
bun dev:web

# Start only the backend API
bun dev:server

# Open database studio
bun db:studio
```

## Production Build

```bash
# Build all applications
bun build

# Start production server
bun start
```

## Project Structure

```
bwitek/
├── apps/
│   ├── web/                 # Next.js Frontend (Port 3001)
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   │   ├── components/  # React components
│   │   │   │   └── utils/       # Utilities & tRPC client
│   │   │   └── messages/        # Internationalization files
│   │   └── messages/        # Internationalization files
│   └── server/              # Hono Backend API (Port 3000)
│       ├── src/
│       │   ├── db/          # Database schema & migrations
│       │   ├── routers/     # tRPC API routes
│       │   ├── services/    # Business logic (Brevo, email)
│       │   └── templates/   # Email templates
│       └── uploads/         # File storage
├── turbo.json               # Turborepo configuration
└── package.json             # Root workspace configuration
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `bun dev` | Start development servers |
| `bun build` | Build all applications |
| `bun db:push` | Apply schema changes to database |
| `bun db:studio` | Open Drizzle Studio |
| `bun db:generate` | Generate database migrations |
| `bun db:migrate` | Run database migrations |

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

**Bogusław Witek**

---

<p align="center">
    <i>Built with modern web technologies and AI assistance</i>
</p>
