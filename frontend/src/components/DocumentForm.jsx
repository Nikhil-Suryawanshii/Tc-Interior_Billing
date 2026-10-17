import { useEffect, useMemo, useState } from 'react';
import { useBlocker } from 'react-router-dom';
import { getData } from '../api';
import { previewDocument, todayInput } from '../lib/format';
import { Button, Field, Panel, controlClass } from './ui';

export const blankItem = () => ({
  name: '',
  description: '',
  sectionHeading: '',
  productId: '',
  categoryId: '',
  quantity: '1',
  unit: 'job',
  unitPrice: '0.00',
  discountAmount: '0.00',
  taxRate: '0.00',
});

export function emptyDocument(kind, defaults = {}) {
  return {
    header: kind === 'invoice' ? 'Invoice' : defaults.header || 'Quotation',
    currency: defaults.currency || 'INR',
    poSoNumber: '',
    quotationDate: todayInput(),
    invoiceDate: todayInput(),
    dueDate: todayInput(),
    validUntil: '',
    clientId: '',
    salutation: defaults.salutation || 'Dear Client,',
    message: defaults.message || '',
    closing: defaults.closing || 'Many thanks,',
    signatory: defaults.signatory || 'THE CONCEPT DESIGNERS',
    terms: defaults.pdfClosingMessage || 'Many thanks for your custom! I look forward to doing business with you.',
    validityText: defaults.quotationTerms || 'Quotation terms: Valid up to 7 days.',
    paymentTerms: defaults.invoicePaymentTerms || '',
    notes: '',
    additionalCharges: '0.00',
    items: [blankItem()],
  };
}

export default function DocumentForm({ kind, initial, errors = {}, onSubmit, saving }) {
  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [form, setForm] = useState(initial);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(initial);
    setDirty(false);
  }, [initial]);

  useEffect(() => {
    getData('/company').then((response) => setCompany(response.data)).catch(() => {});
    getData('/categories').then((response) => setCategories(response.data)).catch(() => {});
    getData('/products', { perPage: 100 }).then((response) => setProducts(response.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      getData('/clients', { search: clientSearch, perPage: 20 }).then((response) => setClients(response.data)).catch(() => {});
    }, 200);
    return () => clearTimeout(handle);
  }, [clientSearch]);

  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Discard unsaved changes?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const preview = useMemo(() => previewDocument(form.items, form.additionalCharges), [form.items, form.additionalCharges]);

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function updateItem(index, patch) {
    update({
      items: form.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  function chooseClient(client) {
    update({ clientId: client.id });
    setClientSearch(client.name);
    setNewClient(false);
    setPickerOpen(false);
  }

  function addProduct(product) {
    update({
      items: [
        ...form.items,
        {
          ...blankItem(),
          name: product.name,
          description: product.description || '',
          productId: product.id,
          categoryId: product.categoryId || '',
          unit: product.unit || 'job',
          unitPrice: product.sellingPrice,
          taxRate: product.taxRate,
          sectionHeading: categories.find((category) => category.id === product.categoryId)?.name || '',
        },
      ],
    });
  }

  const selectedClient = clients.find((client) => client.id === form.clientId);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form, () => setDirty(false));
      }}
    >
      <Panel>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Company</h2>
        <div className="flex gap-4">
          {company?.logoUrl ? <img src={company.logoUrl} alt="" className="h-16 w-16 rounded-md object-contain" /> : null}
          <div className="text-sm text-stone-700">
            <p className="font-semibold text-stone-900">{company?.name}</p>
            <p>{company?.addressLine1}</p>
            <p>{company?.addressLine2}</p>
            <p>{company?.phone} · {company?.email}</p>
            {company?.gstNumber ? <p>GST {company.gstNumber}</p> : null}
          </div>
        </div>
      </Panel>

      <Panel className="grid gap-3 md:grid-cols-4">
        <h2 className="md:col-span-4 text-sm font-semibold uppercase tracking-wide text-stone-500">Document</h2>
        <Field label="Number"><input className={controlClass} value="Assigned on save" disabled /></Field>
        <Field label="P.O. / S.O."><input className={controlClass} value={form.poSoNumber} onChange={(event) => update({ poSoNumber: event.target.value })} /></Field>
        <Field label={kind === 'invoice' ? 'Invoice date' : 'Quotation date'} error={errors[kind === 'invoice' ? 'invoiceDate' : 'quotationDate']}>
          <input type="date" className={controlClass} value={kind === 'invoice' ? form.invoiceDate : form.quotationDate} onChange={(event) => update(kind === 'invoice' ? { invoiceDate: event.target.value } : { quotationDate: event.target.value })} />
        </Field>
        {kind === 'invoice' ? (
          <Field label="Due date" error={errors.dueDate}>
            <input type="date" className={controlClass} value={form.dueDate} onChange={(event) => update({ dueDate: event.target.value })} />
          </Field>
        ) : (
          <Field label="Valid until">
            <input type="date" className={controlClass} value={form.validUntil} onChange={(event) => update({ validUntil: event.target.value })} />
          </Field>
        )}
        <Field label="Header"><input className={controlClass} value={form.header} onChange={(event) => update({ header: event.target.value })} /></Field>
        <Field label="Currency"><input className={controlClass} value={form.currency} onChange={(event) => update({ currency: event.target.value })} /></Field>
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Client</h2>
          <Button type="button" tone="secondary" onClick={() => setPickerOpen(true)}>Choose client</Button>
        </div>
        <p className="text-sm">{selectedClient ? selectedClient.name : clientSearch || 'No client selected yet'}</p>
        {errors.clientId ? <p className="mt-2 text-xs text-red-700">{errors.clientId}</p> : null}
        {pickerOpen ? (
          <div className="mt-3 rounded-md border border-stone-200 p-3">
            <input className={controlClass} placeholder="Search clients" value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} />
            <div className="mt-2 max-h-48 overflow-auto">
              {clients.map((client) => (
                <button type="button" key={client.id} className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-stone-100" onClick={() => chooseClient(client)}>
                  <span className="font-medium">{client.name}</span>
                  <span className="ml-2 text-stone-500">{client.phone}</span>
                </button>
              ))}
            </div>
            <Button type="button" tone="secondary" className="mt-2" onClick={() => setNewClient((value) => !value)}>Add a new client</Button>
            {newClient ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <input className={controlClass} placeholder="Client name" value={form.clientName || ''} onChange={(event) => update({ clientId: '', clientName: event.target.value })} />
                <input className={controlClass} placeholder="Phone" value={form.clientPhone || ''} onChange={(event) => update({ clientPhone: event.target.value })} />
                <input className={`${controlClass} md:col-span-2`} placeholder="Address" value={form.billingAddress || ''} onChange={(event) => update({ billingAddress: event.target.value })} />
              </div>
            ) : null}
          </div>
        ) : null}
      </Panel>

      <Panel className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Message</h2>
        <Field label="Salutation"><input className={controlClass} value={form.salutation} onChange={(event) => update({ salutation: event.target.value })} /></Field>
        <Field label="Message"><textarea className={controlClass} rows={3} value={form.message} onChange={(event) => update({ message: event.target.value })} /></Field>
        <Field label="Closing"><input className={controlClass} value={form.closing} onChange={(event) => update({ closing: event.target.value })} /></Field>
        <Field label="Signatory"><input className={controlClass} value={form.signatory} onChange={(event) => update({ signatory: event.target.value })} /></Field>
      </Panel>

      <Panel>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Items</h2>
          <div className="flex gap-2">
            <select className={controlClass} defaultValue="" onChange={(event) => {
              const parent = categories.find((category) => category.id === event.target.value);
              const sectionPoints = categories.filter((category) => category.parentId === event.target.value);
              if (parent && sectionPoints.length) {
                const kept = form.items.filter((item) => item.name.trim());
                update({
                  items: [
                    ...kept,
                    ...sectionPoints.map((point) => ({
                      ...blankItem(),
                      name: point.name,
                      sectionHeading: parent.name,
                      categoryId: point.id,
                      unitPrice: point.defaultPrice || '0.00',
                      quantity: '1',
                      description: '',
                    })),
                  ],
                });
              }
              event.target.value = '';
            }}>
              <option value="">Add category points</option>
              {categories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select className={controlClass} defaultValue="" onChange={(event) => {
              const product = products.find((item) => item.id === event.target.value);
              if (product) addProduct(product);
              event.target.value = '';
            }}>
              <option value="">Add catalog product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <Button type="button" tone="secondary" onClick={() => update({ items: [...form.items, blankItem()] })}>Add item</Button>
          </div>
        </div>
        {errors.items ? <p className="mb-2 text-xs text-red-700">{errors.items}</p> : null}
        <div className="space-y-3">
          {form.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-stone-200 p-3">
              <div className="grid gap-2 md:grid-cols-4">
                <Field label="Section">
                  <input className={controlClass} list="sections" value={item.sectionHeading} onChange={(event) => updateItem(index, { sectionHeading: event.target.value })} />
                </Field>
                <Field label="Item name" error={errors[`items.${index}.name`]}>
                  <input className={controlClass} value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} />
                </Field>
                <Field label="Quantity"><input className={controlClass} value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} /></Field>
                <Field label="Unit"><input className={controlClass} value={item.unit} onChange={(event) => updateItem(index, { unit: event.target.value })} /></Field>
                <Field label="Unit price"><input className={controlClass} value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} /></Field>
                <Field label="Discount"><input className={controlClass} value={item.discountAmount} onChange={(event) => updateItem(index, { discountAmount: event.target.value })} /></Field>
                <Field label="Tax %"><input className={controlClass} value={item.taxRate} onChange={(event) => updateItem(index, { taxRate: event.target.value })} /></Field>
                <Field label="Line total"><input className={controlClass} value={preview.lines[index] || '0.00'} disabled /></Field>
              </div>
              <textarea className={`${controlClass} mt-2`} rows={4} placeholder="Work specification. Extra lines stay on this one priced item." value={item.description} onChange={(event) => updateItem(index, { description: event.target.value })} />
              <div className="mt-2 flex gap-2">
                <Button type="button" tone="secondary" onClick={() => update({ items: index === 0 ? form.items : form.items.map((row, rowIndex) => (rowIndex === index - 1 ? item : rowIndex === index ? form.items[index - 1] : row)) })}>Up</Button>
                <Button type="button" tone="secondary" onClick={() => update({ items: index === form.items.length - 1 ? form.items : form.items.map((row, rowIndex) => (rowIndex === index + 1 ? item : rowIndex === index ? form.items[index + 1] : row)) })}>Down</Button>
                <Button type="button" tone="secondary" onClick={() => update({ items: [...form.items.slice(0, index + 1), { ...item }, ...form.items.slice(index + 1)] })}>Duplicate</Button>
                <Button type="button" tone="danger" onClick={() => update({ items: form.items.filter((_, rowIndex) => rowIndex !== index) })}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
        <datalist id="sections">
          {categories.map((category) => <option key={category.id} value={category.name} />)}
        </datalist>
      </Panel>

      <Panel className="grid gap-2 text-sm md:grid-cols-2">
        <h2 className="md:col-span-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Summary preview</h2>
        <Field label="Additional charges"><input className={controlClass} value={form.additionalCharges} onChange={(event) => update({ additionalCharges: event.target.value })} /></Field>
        <div className="space-y-1 text-stone-700">
          <p>Subtotal {preview.subtotal}</p>
          <p>Discounts {preview.discountTotal}</p>
          <p>Tax {preview.taxTotal}</p>
          <p className="font-semibold text-stone-900">Preview total {preview.grandTotal}</p>
          <p className="text-xs text-stone-500">The saved document shows the server total.</p>
        </div>
      </Panel>

      <Panel className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Terms</h2>
        <Field label="Closing message"><textarea className={controlClass} rows={2} value={form.terms} onChange={(event) => update({ terms: event.target.value })} /></Field>
        {kind === 'invoice' ? (
          <Field label="Payment terms"><textarea className={controlClass} rows={2} value={form.paymentTerms} onChange={(event) => update({ paymentTerms: event.target.value })} /></Field>
        ) : (
          <Field label="Validity"><input className={controlClass} value={form.validityText} onChange={(event) => update({ validityText: event.target.value })} /></Field>
        )}
        <Field label="Notes"><textarea className={controlClass} rows={2} value={form.notes} onChange={(event) => update({ notes: event.target.value })} /></Field>
      </Panel>

      <Button type="submit" disabled={saving}>{saving ? 'Saving…' : kind === 'invoice' ? 'Save invoice' : 'Save quotation'}</Button>
    </form>
  );
}
