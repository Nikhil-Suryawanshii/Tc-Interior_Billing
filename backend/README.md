# THE CONCEPT DESIGNERS API

Node.js and Express API. Data is stored in MongoDB Atlas. There is no login.

## Requirements

- Node.js 20 or newer
- A MongoDB Atlas cluster, database user, and IP allowlist entry for this machine

## Setup

```bash
cd backend
npm install
```

Copy the connection string into `.env`:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/
MONGODB_DATABASE=the_concept_interior
```

In Atlas, open Network Access and allow this machine’s IP. The database user needs read and write access to `the_concept_interior`.

```bash
npm run seed
npm run dev
```

The API listens on `http://localhost:5002`. Port 5000 is left free because macOS AirPlay uses it.

- Health: `GET /api/v1/health`
- Uploaded files: `/uploads/...`

Do not commit `.env`.
