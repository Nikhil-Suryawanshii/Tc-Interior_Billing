# THE CONCEPT DESIGNERS — Quotation & Invoice Management System

Stack for this project:

- **Backend:** Node.js and Express
- **Database:** MongoDB Atlas
- **Frontend:** React (Vite)

There is no Laravel API, no Flutter app, and no MySQL. There is no login. The React app opens on the dashboard.

Step-by-step build order:

1. `md/backend/01` through `md/backend/09`
2. Then `md/frontend/01` through `md/frontend/09`

```text
React (Vite + Axios)  →  Node.js /api/v1  →  MongoDB Atlas
```

- Totals, document numbers, statuses, and PDFs are calculated in Node.
- React can show a preview while typing. After save, it shows the totals from the API.
- One seeded company owns every record.

## Company seed

| Setting | Value |
|---|---|
| Name | THE CONCEPT DESIGNERS |
| Address line 1 | Plot 127, Siddhivinayak Township, Hirawadi |
| Address line 2 | Nashik, 422003, India |
| Phone | 9860416153 |
| Email | shashankss08@gmail.com |
| Currency | INR |
| Header | Quotation |
| Validity | 7 days |
| Salutation | Dear Client, |
| Message | Please find below a cost-breakdown for the quotation. Please consider this, and do not hesitate to contact me with any question. |
| Closing | Many thanks, |
| Signatory | THE CONCEPT DESIGNERS |
| PDF closing | Many thanks for your custom! I look forward to doing business with you. |
| PDF terms | Quotation terms: Valid up to 7 days. |

These values live in MongoDB and stay editable in Company Settings.

## Statuses

- Quotation: Draft, Sent, Accepted, Rejected, Expired, Converted
- Invoice: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled

Paid and Partially Paid come from payment records. An accepted quotation converts once.
