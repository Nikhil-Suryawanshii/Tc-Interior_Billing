# Frontend step 07 — Invoices and payments

**Depends on:** `06-quotations.md`  
**Next:** `08-pdf.md`

## Goal

Create invoices with the same form sections as quotations, convert an accepted quotation once, and record payments.

## Invoice screens

- List with filters: invoice date, due date, customer, payment status
- Create and edit draft
- Detail with items, totals, payment history, amount paid, and balance due

Reuse the quotation form components.

Draft invoices can be edited. Other statuses are view-only except for recording a payment or cancelling.

## Flows

1. Create an invoice directly.
2. On an Accepted quotation, show Convert to invoice. After success, open the new invoice. If the API returns `422` because it was already converted, show that message.
3. Record payment: amount, date, method, reference, notes. Refresh status, amount paid, and balance from the response.
4. The Payments page lists `GET /payments` with date and customer filters.

## Done when

- A direct invoice and a converted invoice both appear in the invoice list.
- Convert is not offered again after a successful conversion.
- A partial payment changes the status to Partially Paid and shows the remaining balance from the API.
