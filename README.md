# BlogSpace

A full-stack blogging platform where users can register, sign in, write posts,
edit and delete their own posts, and comment on anyone's post.

The frontend and backend are separate packages in one repository. Every feature
talks to a real PostgreSQL database through Prisma - there is no mock data
anywhere in the app (only the optional seed script fills in sample content).

---

## 1. Project overview

BlogSpace is a small but complete CRUD application built to practise the full
stack end to end: React on the front, an Express REST API on the back, and
PostgreSQL underneath, with JWT authentication and hashed passwords.

The important rules it enforces:

- Only signed-in users can create posts or comments.
- Only the **author** of a post can edit or delete it.
- Only the **author** of a comment can edit or delete it.
- Those rules are checked on the server, so they hold even if someone calls the
  API directly with a tool like `curl`.

---

## 2. Features

**Authentication**

- Register with name, email, password and confirm password.
- Log in and stay logged in across page reloads.
- Passwords hashed with bcrypt before they are stored.
- JWT returned on register/login and attached to every authenticated request.
- Invalid or expired tokens sign the user out automatically.

**Posts**

- Blog feed of all posts, newest first, with author, date and comment count.
- Live search by title (debounced).
- Simple pagination.
- Read a single post with its full content and comments.
- Create a post (redirects straight to it).
- Edit and delete your own posts, with a confirmation dialog before deleting.
- Deleting a post also deletes its comments.

**Comments**

- Anyone can read comments, signed-in users can write them.
- Signed-out visitors are shown a "log in to comment" prompt instead of a box.
- Edit and delete your own comments inline.
- Comment count updates as comments are added or removed.

**Interface**

- Responsive layout for mobile, tablet and desktop.
- Loading, empty and error states for every data-fetching screen.
- Inline field validation messages on every form.
- Accessible labels, focus styles and keyboard handling in the confirm dialog.

---

## 3. Tech stack

**Frontend**

| Purpose      | Technology            |
| ------------ | --------------------- |
| UI library   | React 19              |
| Language     | TypeScript            |
| Build tool   | Vite 7                |
| Styling      | Tailwind CSS 4        |
| Routing      | React Router 7        |
| HTTP client  | Axios                 |

**Backend**

| Purpose      | Technology            |
| ------------ | --------------------- |
| Runtime      | Node.js               |
| Framework    | Express 5             |
| Language     | TypeScript            |
| ORM          | Prisma 6              |
| Database     | PostgreSQL            |
| Auth         | JSON Web Tokens       |
| Hashing      | bcryptjs              |
| Validation   | Zod                   |

---

## 4. Project structure

```
blogspace/
├── client/                      # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI pieces (Navbar, PostCard, ...)
│   │   ├── context/             # AuthContext - who is signed in
│   │   ├── hooks/               # useAuth, useDebounce
│   │   ├── layouts/             # MainLayout (navbar + footer)
│   │   ├── lib/                 # Formatting helpers
│   │   ├── pages/               # One file per route
│   │   ├── services/            # Axios instance + API calls
│   │   ├── types/               # Shared types + ApiError
│   │   ├── App.tsx              # Route table
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Tailwind + shared component classes
│   ├── .env.example
│   └── vite.config.ts
│
├── server/                      # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma        # User, Post, Comment models
│   │   └── seed.ts              # Sample users/posts/comments
│   ├── src/
│   │   ├── controllers/         # Parse request -> call service -> respond
│   │   ├── lib/                 # env, prisma client, jwt, errors, helpers
│   │   ├── middleware/          # requireAuth, validateBody, errorHandler
│   │   ├── routes/              # URL -> controller mapping
│   │   ├── services/            # Business logic + database queries
│   │   ├── types/               # Shared server types
│   │   ├── app.ts               # Express app (middleware + routes)
│   │   └── index.ts             # Starts the server
│   ├── .env.example
│   └── tsconfig.json
│
├── .gitignore
├── package.json                 # npm workspaces for client + server
└── README.md
```

The backend is layered on purpose: **routes** decide the URL, **controllers**
deal with HTTP, **services** hold the rules and talk to the database. If a rule
ever changes, there is exactly one file to open.

---

## 5. Prerequisites

- **Node.js 18 or newer** (developed on Node 24) and npm
- **PostgreSQL 14 or newer** running locally (developed on PostgreSQL 18)
- No Docker required

Check what you have:

```bash
node -v
npm -v
```

---

## 6. Installation

From the repository root:

```bash
npm install
```

This installs dependencies for **both** `client` and `server` because the root
`package.json` declares them as npm workspaces.

> **npm 11 note:** npm may block the install scripts for `prisma`, `@prisma/client`
> and `esbuild`. If `npx prisma generate` complains about missing engines, run:
>
> ```bash
> npm approve-scripts prisma @prisma/client @prisma/engines esbuild
> npm install
> ```

---

## 7. Environment variables

Copy the example files and fill them in. Never commit the real `.env` files.

**server/.env** (from `server/.env.example`)

| Variable       | Example                                                          |
| -------------- | ---------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://blogspace:secret@localhost:5432/blogspace?schema=public` |
| `JWT_SECRET`   | a long random string                                             |
| `PORT`         | `5000`                                                           |
| `CORS_ORIGIN`  | `http://localhost:5173`                                          |
| `NODE_ENV`     | `development`                                                    |

`CLIENT_ORIGIN` is still accepted as a deprecated alias for `CORS_ORIGIN`, so
older `.env` files keep working.

`NODE_ENV=production` is what makes Express serve the built React app (see
[section 14](#14-deployment)).

On a managed database, `DATABASE_URL` must be the **pooled** connection string
at runtime, while `prisma migrate` needs the **direct** one. See
`server/.env.example` for the full explanation.

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**client/.env** (from `client/.env.example`)

| Variable       | Example                        |
| -------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:5000/api`    |

---

## 8. Database setup

### 8.1 Create the role and database

Open a PostgreSQL shell as a superuser (the `postgres` user created during
installation) and run the statements below. Replace `CHANGE_ME` with a password
of your choice, and use that same password in `DATABASE_URL`.

```bash
psql -U postgres -h localhost
```

```sql
CREATE ROLE blogspace WITH LOGIN PASSWORD 'CHANGE_ME';
ALTER ROLE blogspace CREATEDB;   -- Prisma Migrate needs this to build its shadow database
CREATE DATABASE blogspace OWNER blogspace;
\q
```

`ALTER ROLE ... CREATEDB` is easy to miss. `prisma migrate dev` creates and
drops a temporary shadow database to detect schema drift, and without this
permission it fails with `P3014: Prisma Migrate could not create the shadow
database`.

If `psql` is not on your PATH on Windows, use the full path, for example:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost
```

### 8.2 Run the migration

From the repository root:

```bash
npm run db:migrate
```

This creates the `User`, `Post` and `Comment` tables.

### 8.3 Generate the Prisma client

```bash
npm run db:generate
```

### 8.4 (Optional) Seed sample data

```bash
npm run db:seed
```

This wipes the tables and inserts three users, five posts and ten comments so
there is something to click around immediately.

To start over from a clean database at any time:

```bash
npm run db:reset
```

To browse the data in a browser:

```bash
npm run db:studio
```

---

## 9. Running frontend

```bash
npm run dev:client
```

Runs Vite on <http://localhost:5173>.

---

## 10. Running backend

```bash
npm run dev:server
```

Runs the API on <http://localhost:5000> and restarts on file changes.
`GET http://localhost:5000/api/health` should return `{"status":"ok"}`.

To run **both** at once from the repository root:

```bash
npm run dev
```

Then open <http://localhost:5173>.

---

## 11. API endpoints

All responses use the same envelope:

```json
{ "success": true, "message": "...", "data": { } }
```

Errors use the same shape without `data`, and validation errors add an
`errors` array of `{ field, message }`:

```json
{
  "success": false,
  "message": "Please fix the highlighted fields.",
  "errors": [{ "field": "email", "message": "Please enter a valid email address." }]
}
```

### Authentication

| Method | Endpoint             | Auth | Description                          |
| ------ | -------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/register` | No   | Create an account, returns JWT       |
| POST   | `/api/auth/login`    | No   | Sign in, returns JWT                 |
| GET    | `/api/auth/me`       | Yes  | The current user (`Authorization`)   |

### Posts

| Method | Endpoint          | Auth | Description                            |
| ------ | ----------------- | ---- | -------------------------------------- |
| GET    | `/api/posts`      | No   | List posts. `?search=&page=&limit=`    |
| GET    | `/api/posts/:id`  | No   | One post with author and comment count |
| POST   | `/api/posts`      | Yes  | Create a post                          |
| PUT    | `/api/posts/:id`  | Yes  | Update a post (author only)            |
| DELETE | `/api/posts/:id`  | Yes  | Delete a post (author only)            |

Every post comes back in this shape, with the author and comment count already
attached so the list does not need extra requests per row:

```json
{
  "id": "…",
  "title": "…",
  "content": "…",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "authorId": "…",
  "author": { "id": "…", "name": "…", "email": "…" },
  "_count": { "comments": 3 }
}
```

### Comments

| Method | Endpoint                     | Auth | Description                |
| ------ | ---------------------------- | ---- | -------------------------- |
| GET    | `/api/posts/:postId/comments`| No   | List a post's comments     |
| POST   | `/api/posts/:postId/comments`| Yes  | Add a comment              |
| PUT    | `/api/comments/:id`          | Yes  | Edit a comment (author)    |
| DELETE | `/api/comments/:id`          | Yes  | Delete a comment (author)  |

### Status codes

| Code | Used for                                     |
| ---- | -------------------------------------------- |
| 200  | Successful read / update / delete            |
| 201  | Resource created (register, post, comment)   |
| 400  | Validation error (bad input, duplicate email)|
| 401  | Not signed in, or invalid/expired token      |
| 403  | Signed in but not allowed (not the author)   |
| 404  | Resource (or route) does not exist           |
| 500  | Unexpected server error                      |

### A quick manual check

```bash
# Register (returns a token)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Password123\",\"confirmPassword\":\"Password123\"}"

# Use the token
curl http://localhost:5000/api/posts \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

---

## 12. Sample test credentials

Created by `npm run db:seed`:

| Name         | Email               | Password      |
| ------------ | ------------------- | ------------- |
| Alice Johnson| `alice@example.com` | `Password123` |
| Bob Smith    | `bob@example.com`   | `Password123` |
| Carol Diaz   | `carol@example.com` | `Password123` |

The seed password only exists in `server/prisma/seed.ts`. Nothing in the
application itself contains a hard-coded password.

---

## 13. Future improvements

Things this project deliberately leaves out:

- **Refresh tokens.** The JWT lives for 7 days and is stored in `localStorage`.
  A production app would use short-lived access tokens with refresh tokens in
  `httpOnly` cookies.
- **A "posts by author" endpoint.** `/my-posts` pages through the public feed and
  filters in the browser. That works for a small blog but should become
  `GET /api/posts?authorId=...`.
- **Rate limiting** on login and register.
- **Rich text or Markdown** posts instead of plain text with preserved line breaks.
- **Avatar uploads** (the UI currently derives initials from the name).
- **Automated tests.** The flows were verified manually; there is no test suite yet.
- **Pagination on `/my-posts`**, which currently loads every page of the feed.

Known non-issues you may notice:

- `npm audit` reports 3 high-severity advisories from `deepmerge-ts`, pulled in
  by the **Prisma CLI** (a dev dependency). It is not part of the running server.
- Prisma prints a deprecation warning about the `package.json#prisma` seed
  setting. It still works in Prisma 6 and will move to `prisma.config.ts` in
  Prisma 7.

---

## 14. Deployment

BlogSpace deploys as a **single service**: one Node process serves both the
Express API and the built React app from `client/dist`. That means one origin,
one URL, no CORS in production, and no second service to keep in sync.

```text
Browser --> Express (one service)
             |-- /api/*         -> JSON API
             \-- everything else -> React SPA (client-side routing)
```

When `NODE_ENV=production`, `server/src/app.ts` enables static file serving plus
an SPA fallback. Deep links such as `/posts/abc` return `index.html` so React
Router can take over, while unmatched `/api/*` paths still fall through to the
JSON 404 handler. The fallback deliberately refuses to serve HTML for API paths,
non-GET methods, or requests that do not accept HTML.

### 14.1 Environment variables required

| Variable       | Required | Notes                                                             |
| -------------- | -------- | ----------------------------------------------------------------- |
| `NODE_ENV`     | yes      | Must be `production`, otherwise the client is not served          |
| `DATABASE_URL` | yes      | **Pooled** connection string                                       |
| `JWT_SECRET`   | yes      | 16+ characters; let the host generate it                           |
| `PORT`         | no       | Render/Railway/Fly inject it; leave unset in production           |
| `CORS_ORIGIN`  | no       | Only needed if the frontend is hosted separately                  |

`render.yaml` supplies `NODE_ENV` and generates `JWT_SECRET` automatically.

### 14.2 Provision the database

Neon's free tier suits this. Create a project, then copy **both** connection
strings: the *pooled* one becomes `DATABASE_URL`, and the *direct* one is kept
for migrations. See `server/.env.example` for why the two are not interchangeable.

### 14.3 Apply the migration

Migrations cannot run through a transaction pooler, so run this once from your
own machine with the direct URL:

```bash
DATABASE_URL="postgresql://.../blogspace?sslmode=require&directConnection=true" \
  npx prisma migrate deploy --schema server/prisma/schema.prisma
```

Optionally insert sample data:

```bash
npx prisma db seed --schema server/prisma/schema.prisma
```

### 14.4 Deploy to Render

1. Push the repo to GitHub.
2. In the Render dashboard choose **New** -> **Blueprint**, then select the repo.
   `render.yaml` is picked up automatically.
3. Render prompts for the one secret it cannot generate and creates
   `JWT_SECRET` for you:
   - `DATABASE_URL` -> the **pooled** string
   - `CORS_ORIGIN` -> leave blank for a single-service deployment
4. Deploy. The build runs `npm ci && npm run build`, and start runs
   `npm run start --workspace server`.
5. Health is checked against `/api/health`.

The app is then live at `https://blogspace.onrender.com`.

### 14.5 Updating the deployment

Pushing to `main` triggers a rebuild automatically.

### 14.6 Things to know

- **The free tier sleeps.** An idle free web service spins down after roughly 15
  minutes and the first request afterwards is slow while it wakes up. This is
  normal and not a fault in the app.
- **TLS is terminated by the platform proxy.** `trust proxy` is enabled so
  `secure` cookies and client IPs are read correctly from `X-Forwarded-For`.
- **Migrations are not automatic.** Re-run section 14.3 whenever you add one.
- **`client/dist` is build output**, so it is git-ignored and rebuilt by Render
  rather than committed.

---

## Useful commands

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm install`          | Install everything (both workspaces)            |
| `npm run dev`          | Run API and frontend together                   |
| `npm run dev:server`   | Run only the API                                |
| `npm run dev:client`   | Run only the frontend                           |
| `npm run build`        | Production build of server and client           |
| `npm run typecheck`    | TypeScript check for server and client          |
| `npm run db:migrate`   | Create/apply database migrations                |
| `npm run db:generate`  | Regenerate the Prisma client                    |
| `npm run db:seed`      | Insert sample data                              |
| `npm run db:reset`     | Drop, re-migrate and re-seed the database       |
| `npm run db:studio`    | Open Prisma Studio to browse the data           |
