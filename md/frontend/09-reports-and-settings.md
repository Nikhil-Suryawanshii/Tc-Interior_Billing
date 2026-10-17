# Frontend step 09 — Reports and company settings

**Depends on:** `08-pdf.md`  
**Next:** none. This is the last React step.

## Goal

Reports and company settings finish the personal-use app. Still no login.

## Reports

Call `GET /api/v1/reports/{slug}` with a from/to date filter.

Pages or sections:

- Quotations by status
- Accepted versus rejected
- Quotation-to-invoice conversion
- Invoice sales
- Payments received
- Outstanding payments
- Overdue invoices
- Client-wise sales
- Product-wise sales
- Monthly and yearly revenue

Show issued sales, paid amounts, and outstanding balances as separate figures. Each report has a CSV download from `GET /api/v1/reports/{slug}/export`.

## Company settings

`GET` and `PUT /company`, plus logo and signature upload.

Editable: name, GST, address, phone, email, website, currency, header, validity, salutation, message, closing, signatory, PDF closing, quotation terms, invoice payment terms, logo, and signature.

After a successful save, new quotation forms load the new defaults. Old saved documents keep the snapshots already stored by the API.

## Final check

1. Start the API, then the React app. The dashboard opens with no login.
2. Add a client and a product.
3. Create a quotation with a long Living Room description, save, and download the PDF.
4. Mark it Accepted and convert it.
5. Record a partial payment and confirm Partially Paid on the invoice and on the dashboard after refresh.
6. Change the company phone and confirm a new quotation form uses it.

## Done when

- Those six checks pass on a desktop width and a narrow browser width.
- Report figures match the API for the same dates.
- The app still has no login, logout, or password page.
