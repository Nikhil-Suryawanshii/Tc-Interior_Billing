# Frontend step 05 — Products and categories

**Depends on:** `04-clients.md`  
**Next:** `06-quotations.md`

## Goal

Manage the catalog React uses when building a quotation or invoice.

## Products

- List with search, category filter, active filter, and pagination
- Create, edit, and detail
- Fields: name, SKU, description, category, unit, selling price, cost price, tax rate, active switch, optional image
- Image upload calls `POST /products/{id}/image` after the product exists

## Categories

- List, create, edit, delete
- Fields: name, description, active, sort order
- The seven seeded categories appear without being typed in again

## Done when

- A product saved in the browser appears in `GET /products?search=`.
- The category filter limits the product list.
- Deleting a category that still has products shows the API error.
