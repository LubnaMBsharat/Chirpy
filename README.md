# Chirpy

Chirpy is a Twitter-like REST API I built while working through [Boot.dev](https://boot.dev)'s HTTP Servers course. It's my learning project for backend development with **TypeScript**, **Express**, **PostgreSQL**, and **Drizzle ORM**.

## Tech Stack

- **Runtime:** Node.js (v22, see `.nvmrc`)
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Auth:** JWT (`jsonwebtoken`) + `argon2` for password hashing
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for the exact version)
- PostgreSQL running locally

### Setup

1. Clone the repo:
```bash
git clone https://github.com/LubnaMBsharat/Chirpy.git
cd Chirpy
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root of the project:
```
DB_URL="postgres://username:password@localhost:5432/chirpy?sslmode=disable"
PLATFORM="dev"
JWT_SECRET="your-super-secret-random-string"
POLKA_KEY="your-polka-api-key"
```

> ⚠️ Never commit your `.env` file — it's already listed in `.gitignore`.

You can generate a strong `JWT_SECRET` with:
```bash
openssl rand -base64 64
```

4. Generate and run the migrations, then start the server:
```bash
npm run generate   # generates migration files from the schema
npm run dev         # builds and starts the server — migrations run automatically on startup
```

5. Run the tests:
```bash
npm run test
```

## API Documentation

All endpoints return JSON unless otherwise noted. Authenticated endpoints expect a JWT access token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

### Health & Admin

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/api/healthz` | Health check. Returns `200 OK` with `text/plain`. |
| GET | `/admin/metrics` | Returns an HTML page showing how many times `/app` has been visited. |
| POST | `/admin/reset` | Resets the users table and hit counter. **Only works when `PLATFORM=dev`** — returns `403` otherwise. |

---

### Users

#### Create a user
```
POST /api/users
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**Response `201`:**
```json
{
  "id": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "email": "user@example.com",
  "isChirpyRed": false
}
```
Passwords are hashed with `argon2` before being stored — the raw password is never saved.

#### Update a user
```
PUT /api/users
```
🔒 Requires an access token.

**Body:**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword"
}
```
**Response `200`:** same shape as create user.

---

### Authentication

#### Log in
```
POST /api/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**Response `200`:**
```json
{
  "id": "uuid",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "email": "user@example.com",
  "isChirpyRed": false,
  "token": "access-token-jwt",
  "refreshToken": "refresh-token-string"
}
```
- Access tokens (JWTs) expire after **1 hour**.
- Refresh tokens expire after **60 days** and are stored server-side, so they can be revoked.

#### Refresh an access token
```
POST /api/refresh
```
🔒 Requires a **refresh token** (not an access token) in the `Authorization` header.

**Response `200`:**
```json
{
  "token": "new-access-token-jwt"
}
```
Returns `401` if the refresh token is missing, invalid, expired, or has been revoked.

#### Revoke a refresh token
```
POST /api/revoke
```
🔒 Requires a refresh token in the `Authorization` header.

**Response:** `204 No Content` — the refresh token can no longer be used to get new access tokens.

---

### Chirps

#### Create a chirp
```
POST /api/chirps
```
🔒 Requires an access token. The chirp's author is taken from the token, not from the request body.

**Body:**
```json
{
  "body": "Hello, world!"
}
```
- Max length: 140 characters (`400` if exceeded).

**Response `201`:**
```json
{
  "id": "uuid",
  "createdAt": "timestamp",
  "updateAt": "timestamp",
  "body": "Hello, world!",
  "userId": "uuid"
}
```

#### Get all chirps
```
GET /api/chirps
```
**Optional query parameters:**

| Param | Values | Description |
|-------|--------|--------------|
| `authorId` | any user UUID | Only return chirps from that author |
| `sort` | `asc` (default) or `desc` | Sort results by `createdAt` |

**Examples:**
```
GET /api/chirps
GET /api/chirps?authorId=3311741c-680c-4546-99f3-fc9efac2036c
GET /api/chirps?sort=desc
```

**Response `200`:** array of chirp objects (same shape as above).

#### Get a single chirp
```
GET /api/chirps/:chirpId
```
**Response `200`:** a single chirp object, or `404` if not found.

#### Delete a chirp
```
DELETE /api/chirps/:chirpId
```
🔒 Requires an access token. Only the chirp's author can delete it.

**Responses:**
- `204` — deleted successfully
- `403` — you're not the author of this chirp
- `404` — chirp not found

---

### Webhooks

#### Polka payment webhook
```
POST /api/polka/webhooks
```
Simulates receiving a webhook from a payment provider ("Polka") when a user upgrades to Chirpy Red membership.

🔒 Requires an API key, sent the same way as a bearer token:
```
Authorization: Bearer <POLKA_KEY>
```
This is different from user authentication — Polka isn't a user, it's the external service itself, so it authenticates with a static API key (set in `.env` as `POLKA_KEY`) instead of a JWT. On every request, the server compares the key it received against the one stored in its own config; if they don't match, it responds with `401`.

**Body:**
```json
{
  "event": "user.upgraded",
  "data": {
    "userId": "uuid"
  }
}
```
- If the API key is missing or doesn't match, responds with `401` before looking at the payload at all.
- Any `event` other than `user.upgraded` is ignored and returns `204` immediately.
- If `event` is `user.upgraded`, the matching user's `isChirpyRed` field is set to `true`.
- Responses: `204` (success or ignored event), `401` (invalid API key), `404` (user not found).

---

## Error Responses

All errors follow this shape:
```json
{
  "error": "A human-readable message"
}
```

| Status | Meaning |
|--------|----------|
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (missing/invalid/expired token, or wrong credentials) |
| `403` | Forbidden (you don't have permission for this action) |
| `404` | Not found |
| `500` | Something went wrong on the server |

Custom error classes (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`) map directly to these status codes. Any other, unexpected error is logged server-side and returned to the client as a generic `500` — the real error message is never leaked to the client unless it came from one of these custom errors.

## Project Structure

```
src/
  admin/
    metrics.ts          # GET /admin/metrics
    reset.ts            # POST /admin/reset
  api/
    readiness.ts        # GET /api/healthz
    login.ts            # POST /api/login
    refresh.ts           # POST /api/refresh
    revoke.ts            # POST /api/revoke
    users/
      createUser.ts      # POST /api/users
      updateUser.ts      # PUT /api/users
    chirps/
      createChirp.ts     # POST /api/chirps
      getAllChirps.ts    # GET /api/chirps
      getChirp.ts        # GET /api/chirps/:chirpId
      deleteChirp.ts     # DELETE /api/chirps/:chirpId
    polka/
      webhooks.ts        # POST /api/polka/webhooks
  db/
    queries/             # database query functions (one file per resource)
    schema.ts            # Drizzle schema definitions
    index.ts             # database connection (Drizzle + postgres.js)
  auth.ts                # password hashing, JWT creation/validation, bearer token parsing
  config.ts              # environment config (API + DB config)
  errors.ts              # custom error classes
  middleware.ts           # request logging, hit metrics, centralized error handler
  auth.test.ts            # Vitest unit tests for auth.ts
  index.ts                # app entry point — runs migrations, then starts the server
```

## Note

This is a learning project — some design decisions (like resetting the whole database via an admin endpoint) are intentionally simple and would need to change for a real production app. Feedback and suggestions are welcome!
