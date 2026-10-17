# THE CONCEPT DESIGNERS

React dashboard for quotations and invoices. It opens on the dashboard. There is no login.

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and calls the API at `http://localhost:5002/api/v1`.

Start the API first. Put the MongoDB Atlas connection string in `backend/.env`, then run `npm run seed` and `npm run dev` inside `backend`.
