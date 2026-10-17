# Frontend step 04 — Clients

**Depends on:** `03-dashboard.md`  
**Next:** `05-products.md`

## Goal

List, search, create, edit, and view clients, including document history.

## Screens

- List with search and pagination
- Create and edit form
- Detail with contact fields and history: quotations, invoices, payments

## Fields

Name (required), GST, phone, email, attention, billing address, shipping or project address, city, state, postal code, country, notes.

## Steps

1. List uses `GET /clients` with `search`, `page`, and `perPage`.
2. Save uses POST or PUT. Show `422` field errors under the inputs.
3. Detail calls `GET /clients/{id}` and `GET /clients/{id}/history`.
4. Delete asks for confirmation, then calls DELETE. Show the API error when the client is used on a document.

## Done when

- A client created in the browser is returned by `GET /api/v1/clients`.
- Search by phone finds that client.
- History shows empty lists for a new client.
