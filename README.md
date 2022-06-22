# Teknofest

Teknofest is my master's graduation project for [Gazi University Department of Computer Science](https://be.gazi.edu.tr/).

It's a process-based application and evaluation system for project competitions. It enables advisors of teams to have observability into their own progress and missing requirements. Judges can also see the progress of the teams.

The project is built with the following tools and technologies:

- [TypeScript](https://www.typescriptlang.org/) for type-safety
- [React](https://reactjs.org/) for the frontend
- [Remix](https://remix.run/) for the backend
- [Docker](https://www.docker.com/) for deployment
- [SQLite](https://www.sqlite.org/) as the database
- [Prisma](https://www.prisma.io/) as the ORM
- [Fly.io](https://fly.io/) for hosting
- [GitHub Actions](https://github.com/features/actions) for CI/CD
- [Playwright](https://www.playwright.dev/) for end-to-end testing

You can find a running instance at [teknofest.fly.dev](https://teknofest.fly.dev) to play around.

## Development

- Initial setup:

  ```sh
  npm run db:setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `admin@teknofest.org`
- Password: `adminpassword`
