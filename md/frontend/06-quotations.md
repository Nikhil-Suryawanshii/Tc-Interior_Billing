# Frontend step 06 — Quotations

**Depends on:** `05-products.md`  
**Next:** `07-invoices-and-payments.md`

## Goal

A full quotation list and form. Generate PDF comes in step 08. This step must save and reload a quotation.

## List

Search by number and customer name. Filter by date, status, amount, and customer. Sortable columns and pagination.

Row actions: view, edit, duplicate, change status, archive. Hide edit when status is Converted.

## Form sections

**Company**  
Show logo, name, GST, address, phone, email, and website from `GET /company`. Read-only on this form.

**Document**  
Number appears after save. Before save, show “Assigned on save”. Optional P.O. / S.O., date, header, currency. Header defaults to Quotation.

**Client**  
Fields plus a client picker. Choosing a client fills the form. Allow adding a new client in a dialog without leaving the page. If the user typed a new name and did not pick an id, send the inline client on save.

**Message**  
Salutation, message, closing, and signatory, prefilled from `GET /company/defaults` and editable for this quotation.

**Items**  
Add, edit, duplicate, reorder, and delete lines. Each line has name, description, section heading, quantity, unit, unit price, discount, tax rate, and a line preview. A catalog product can fill name, price, unit, and tax. A long description stays on one item.

**Summary**  
Show a local preview, then replace subtotal, discounts, tax, additional charges, and grand total with the save response.

**Terms**  
Closing message, validity, and notes. Defaults:

- Many thanks for your custom! I look forward to doing business with you.
- Quotation terms: Valid up to 7 days.

Warn before leaving with unsaved edits.

## Done when

- Save returns a `QUO …` number and server totals, and those totals are what the page shows.
- The client picker fills the form.
- One Living Room item with a long description is still one item after reload.
