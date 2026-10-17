# Frontend step 03 — Dashboard

**Depends on:** `02-app-shell.md`  
**Next:** `04-clients.md`

## Goal

The dashboard shows live numbers from `GET /api/v1/dashboard` and the company name from `GET /api/v1/company`.

## Show

- Company name and logo
- Cards: clients, products, quotations, accepted quotations, pending quotations, rejected and expired quotations, invoices, paid, unpaid, partially paid, outstanding amount, revenue received
- Recent quotations and recent invoices
- Monthly revenue chart
- Quotation conversion chart
- Outstanding payment summary
- Links to create a quotation, create an invoice, and add a client

Use one chart library, such as Recharts. All figures come from the API.

## Steps

1. Load company and dashboard together. Show a loader, then the cards. On failure, show retry.
2. Recent rows link to the quotation or invoice detail route.
3. Refresh the page and the numbers reload from the API.

## Done when

- Cards match the JSON, including zero values on an empty database.
- After a quotation exists in Atlas, a refresh shows it under recent quotations.
