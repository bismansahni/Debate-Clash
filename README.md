# 🎯 AI Debate Arena - Monorepo

A scalable monorepo for the AI Debate Arena platform, powered by Turborepo and pnpm workspaces.

## 📦 Project Structure

```
inngest-learning/
├── apps/
│   ├── frontend/          # Next.js frontend (Debate UI)
│   └── inngest-service/   # Inngest backend (AI agents, workflows)
├── packages/
│   ├── shared-types/      # Shared TypeScript types
│   └── tsconfig/          # Shared TypeScript configs
├── turbo.json             # Turborepo configuration
├── pnpm-workspace.yaml    # pnpm workspace config
└── package.json           # Root package.json
```

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Or run specific apps:

```bash
# Frontend only
pnpm --filter debator dev

# Backend only
pnpm --filter inngest-service dev
```

### Build

Build all apps:

```bash
pnpm build
```

Build specific apps:

```bash
# Frontend only
pnpm --filter debator build

# Backend only
pnpm --filter inngest-service build
```

### Type Checking

Check TypeScript across all workspaces:

```bash
pnpm type-check
```

### Testing (Inngest Service)

```bash
# Run all tests
pnpm --filter inngest-service test

# Run specific tests
pnpm --filter inngest-service test:simple
pnpm --filter inngest-service test:complex
pnpm --filter inngest-service test:bugfix
```

## 📋 Available Scripts (Root Level)

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all apps |
| `pnpm dev` | Run all apps in dev mode |
| `pnpm type-check` | Type check all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm clean` | Clean all build outputs |

## 🏗️ Apps

### Frontend (`apps/frontend`)

- **Tech Stack**: Next.js 16, React 19, Tailwind CSS
- **Port**: 3000 (default)
- **Features**: Debate UI, real-time updates, confetti animations

### Inngest Service (`apps/inngest-service`)

- **Tech Stack**: Express, Inngest, AI SDK (Google Gemini)
- **Port**: 3000 (default)
- **Features**: AI debate agents, workflow orchestration, research system

## 📦 Packages

### Shared Types (`packages/shared-types`)

Shared TypeScript types and interfaces used across frontend and backend.

### TypeScript Config (`packages/tsconfig`)

Shared TypeScript configuration for consistent compilation across all apps.

## 🔧 Turborepo Features

- **Parallel Execution**: Run tasks across multiple apps simultaneously
- **Smart Caching**: Skips rebuilding unchanged packages
- **Dependency Graph**: Automatically runs tasks in the correct order
- **Remote Caching**: (Optional) Share build cache across team

## 📝 Environment Variables

Each app manages its own `.env` file:

- `apps/frontend/.env` - Frontend environment variables
- `apps/inngest-service/.env` - Backend API keys (Google AI, etc.)

**Note**: `.env` files are gitignored for security.

## 🌍 Adding New Apps

1. Create new directory in `apps/`:
   ```bash
   mkdir apps/my-new-app
   ```

2. Add `package.json` with unique name:
   ```json
   {
     "name": "my-new-app",
     "version": "0.0.1",
     "scripts": {
       "dev": "...",
       "build": "..."
     }
   }
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Turborepo will automatically detect it!

## 🎓 Useful Commands

```bash
# Install package to specific app
pnpm --filter frontend add react-icons

# Run command in specific app
pnpm --filter inngest-service dev

# Run command in all apps
pnpm -r dev

# Update all dependencies
pnpm up -r

# Check which apps will be affected by changes
pnpm turbo run build --dry-run
```

## 📚 Documentation

- [Inngest Service Testing Guide](./apps/inngest-service/TESTING_GUIDE.md)
- [Debate System Design](./AI_DEBATE_ARENA_DESIGN.md)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd apps/frontend
vercel deploy
```

### Backend (Any Node.js host)

```bash
cd apps/inngest-service
pnpm build
pnpm start
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm build` to verify everything compiles
4. Run `pnpm type-check` to verify types
5. Commit and push

## 📄 License

ISC

---

**Built with ❤️ using Turborepo, pnpm, Next.js, and Inngest**
