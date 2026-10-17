import { useEffect, useState } from 'react';
import { getData, send, upload } from '../api';
import { Button, Field, Notice, PageHeader, Panel, controlClass } from '../components/ui';

const textFields = [
  ['name', 'Company name'],
  ['gstNumber', 'GST / tax number'],
  ['addressLine1', 'Address line 1'],
  ['addressLine2', 'Address line 2'],
  ['city', 'City'],
  ['state', 'State'],
  ['postalCode', 'Postal code'],
  ['country', 'Country'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['bankName', 'Bank name'],
  ['bankAccountName', 'Account name'],
  ['bankAccountNumber', 'Account number'],
  ['bankIfsc', 'IFSC'],
  ['bankBranch', 'Branch'],
  ['bankUpi', 'UPI'],
  ['defaultCurrency', 'Currency'],
  ['defaultHeader', 'Document header'],
  ['defaultValidityDays', 'Validity days'],
  ['quotationPrefix', 'Quotation prefix'],
  ['invoicePrefix', 'Invoice prefix'],
  ['nextQuotationNumber', 'Next quotation number'],
  ['nextInvoiceNumber', 'Next invoice number'],
  ['defaultSalutation', 'Salutation'],
  ['defaultClosing', 'Closing'],
  ['defaultSignatory', 'Signatory'],
];

export default function Settings() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getData('/company').then((response) => setForm(response.data)).catch((err) => setError(err.message));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const response = await send('put', '/company', form);
      setForm(response.data);
      setMessage('Company settings saved');
    } catch (err) {
      setError(err.message);
    }
  }

  async function sendFile(event, path) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const response = await upload(path, file);
      setForm(response.data);
      setMessage('Image updated');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!form) return <Notice error={error || 'Loading settings…'} />;

  return (
    <form onSubmit={submit}>
      <PageHeader title="Company settings" />
      <Notice error={error} message={message} />
      <Panel className="mb-4 grid gap-3 md:grid-cols-2">
        {textFields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input className={controlClass} value={form[key] ?? ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          </Field>
        ))}
        <Field label="Default message"><textarea className={`${controlClass} md:col-span-2`} rows={3} value={form.defaultMessage || ''} onChange={(event) => setForm({ ...form, defaultMessage: event.target.value })} /></Field>
        <Field label="PDF closing"><textarea className={controlClass} rows={3} value={form.pdfClosingMessage || ''} onChange={(event) => setForm({ ...form, pdfClosingMessage: event.target.value })} /></Field>
        <Field label="Quotation terms"><textarea className={controlClass} rows={3} value={form.quotationTerms || ''} onChange={(event) => setForm({ ...form, quotationTerms: event.target.value })} /></Field>
        <Field label="Invoice payment terms"><textarea className={`${controlClass} md:col-span-2`} rows={2} value={form.invoicePaymentTerms || ''} onChange={(event) => setForm({ ...form, invoicePaymentTerms: event.target.value })} /></Field>
      </Panel>
      <Panel className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Logo</p>
          {form.logoUrl ? <img src={form.logoUrl} alt="" className="mb-2 h-20 object-contain" /> : null}
          <input type="file" accept="image/*" onChange={(event) => sendFile(event, '/company/logo')} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Signature</p>
          {form.signatureUrl ? <img src={form.signatureUrl} alt="" className="mb-2 h-20 object-contain" /> : null}
          <input type="file" accept="image/*" onChange={(event) => sendFile(event, '/company/signature')} />
        </div>
      </Panel>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
