# Frontend step 02 — App shell

**Depends on:** `01-setup.md`  
**Next:** `03-dashboard.md`

## Goal

The app opens on the dashboard. A sidebar reaches every area. There is no login and no logout.

## Sidebar

1. Dashboard
2. Quotations
3. Invoices
4. Clients
5. Products & Services
6. Categories
7. Payments
8. Reports
9. Company Settings

Do not add Users, Profile, or Logout.

## Steps

1. Build a responsive layout: sidebar on desktop, a collapsible menu on a narrow screen.
2. Each item opens its own route. Later steps fill the pages. This step can use a titled placeholder.
3. Shared pieces to add now:
   - page header
   - data table
   - status badge
   - empty state
   - error state with retry
   - loading state
   - money text
   - confirm dialog
4. Quotation and invoice forms, added later, must warn before discarding unsaved changes.

## Done when

- Cold start lands on `/`.
- Every sidebar item opens.
- Nothing on screen asks for an email or password.
