# Frontend step 08 — PDF

**Depends on:** `07-invoices-and-payments.md`  
**Next:** `09-reports-and-settings.md`

## Goal

Download, print, and open the PDF produced by the Node API. React does not draw the document.

## Steps

1. Add Download PDF and Print on the quotation and invoice detail pages.
2. Download calls `GET /quotations/{id}/pdf` or `GET /invoices/{id}/pdf` and saves the file in the browser.
3. Print opens that PDF and calls the browser print dialog.
4. On the form, Generate saves first, then downloads the PDF for the saved id.
5. Show a clear error if save or download fails. Do not build a PDF from unsaved form data.

## Done when

- Generate on a new quotation creates the Atlas document first, then downloads the API PDF.
- The same file opens from the detail page after a refresh.
- Print uses that downloaded file.
