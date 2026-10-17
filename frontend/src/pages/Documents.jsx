import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getData, openPdf, send } from '../api';
import { dateInput, inr, prettyDate } from '../lib/format';
import DocumentForm, { emptyDocument } from '../components/DocumentForm';
import { Button, Empty, Field, Notice, PageHeader, Panel, StatusBadge, controlClass } from '../components/ui';
import { Pager } from './Clients';

function groupSections(items = []) {
  const groups = [];
  items.forEach((item) => {
    const heading = item.sectionHeading || 'Items';
    const last = groups[groups.length - 1];
    if (!last || last.heading !== heading) groups.push({ heading, items: [item] });
    else last.items.push(item);
  });
  return groups;
}

function previewLine(item) {
  const quantity = Number(item.quantity || 0);
  const price = Number(item.unitPrice || 0);
  const discount = Number(item.discountAmount || 0);
  const taxRate = Number(item.taxRate || 0);
  const subtotal = Math.max(quantity * price - discount, 0);
  const tax = taxRate > 0 ? subtotal * taxRate / 100 : 0;
  return (subtotal + tax).toFixed(2);
}

function toForm(record) {
  return {
    ...emptyDocument('quotation'),
    ...record,
    quotationDate: dateInput(record.quotationDate),
    invoiceDate: dateInput(record.invoiceDate),
    dueDate: dateInput(record.dueDate),
    validUntil: dateInput(record.validUntil),
    clientId: record.clientId || '',
    items: (record.items || []).map((item) => ({
      ...item,
      productId: item.productId || '',
      categoryId: item.categoryId || '',
    })),
  };
}

function payload(form) {
  return {
    ...form,
    items: form.items.map((item, index) => ({ ...item, sortOrder: index, productId: item.productId || null, categoryId: item.categoryId || null })),
  };
}

export function QuotationList() {
  return <DocumentList kind="quotation" />;
}

export function InvoiceList() {
  return <DocumentList kind="invoice" />;
}

export function QuotationEditor() {
  return <DocumentEditor kind="quotation" />;
}

export function InvoiceEditor() {
  return <DocumentEditor kind="invoice" />;
}

export function QuotationView() {
  return <DocumentView kind="quotation" />;
}

export function InvoiceView() {
  return <DocumentView kind="invoice" />;
}

function DocumentList({ kind }) {
  const base = kind === 'invoice' ? '/invoices' : '/quotations';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const statuses = kind === 'invoice'
    ? ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled']
    : ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'];

  useEffect(() => {
    const params = { search, status, page };
    if (kind === 'invoice') {
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    } else {
      params.dateFrom = dateFrom;
      params.dateTo = dateTo;
    }
    getData(base, params).then(setResult).catch((err) => setError(err.message));
  }, [base, search, status, dateFrom, dateTo, page, kind]);

  return (
    <div>
      <PageHeader title={kind === 'invoice' ? 'Invoices' : 'Quotations'}>
        <Link to={`${base}/new`}><Button>{kind === 'invoice' ? 'New invoice' : 'New quotation'}</Button></Link>
      </PageHeader>
      <Notice error={error} />
      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <input className={controlClass} placeholder="Search number or client" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
        <select className={controlClass} value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          <option value="">All statuses</option>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input type="date" className={controlClass} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input type="date" className={controlClass} value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
      </div>
      {!result?.data?.length ? <Empty>No documents yet.</Empty> : (
        <Panel className="overflow-x-auto">
          <table className="responsive-table w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr><th className="py-2">Number</th><th>Client</th><th>Date</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {result.data.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="py-2" data-label="Number"><Link className="font-medium hover:underline" to={`${base}/${row.id}`}>{row.number}</Link></td>
                  <td data-label="Client">{row.clientName}</td>
                  <td data-label="Date">{prettyDate(row.quotationDate || row.invoiceDate)}</td>
                  <td data-label="Status"><StatusBadge status={row.status} /></td>
                  <td data-label="Total">{inr(row.grandTotal, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
      <Pager page={result?.meta?.currentPage || 1} total={result?.meta?.total || 0} perPage={result?.meta?.perPage || 15} onPage={setPage} />
    </div>
  );
}

function DocumentEditor({ kind }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = kind === 'invoice' ? '/invoices' : '/quotations';
  const [initial, setInitial] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getData(`${base}/${id}`)
        .then((response) => {
          if (kind === 'quotation' && response.data.convertedInvoiceId) {
            navigate(`/quotations/${id}`);
            return;
          }
          if (kind === 'invoice' && response.data.status !== 'Draft') {
            navigate(`/invoices/${id}`);
            return;
          }
          setInitial(toForm(response.data));
        })
        .catch((err) => setError(err.message));
      return;
    }
    getData('/company/defaults')
      .then((response) => setInitial(emptyDocument(kind, response.data)))
      .catch((err) => setError(err.message));
  }, [id, kind, base, navigate]);

  async function submit(form, clearDirty) {
    setSaving(true);
    setError('');
    try {
      const response = await send(id ? 'put' : 'post', id ? `${base}/${id}` : base, payload(form));
      clearDirty();
      navigate(`${base}/${response.data.id}`);
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title={id ? `Edit ${kind}` : `New ${kind}`} />
      <Notice error={error} />
      {initial ? <DocumentForm kind={kind} initial={initial} errors={errors} onSubmit={submit} saving={saving} simpleInvoice={kind === 'invoice' && !id} /> : <p className="text-sm text-stone-500">Loading form…</p>}
    </div>
  );
}

function DocumentView({ kind }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = kind === 'invoice' ? '/invoices' : '/quotations';
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [payment, setPayment] = useState({ amount: '', paymentDate: dateInput(new Date()), method: 'UPI', reference: '', notes: '' });

  function load() {
    getData(`${base}/${id}`).then((response) => setRecord(response.data)).catch((err) => setError(err.message));
  }
  useEffect(load, [base, id]);

  async function run(action) {
    setError('');
    try {
      const response = await action();
      if (response?.data?.id && response.data.number && response.data.number !== record?.number && kind === 'quotation' && action.name === '') {
        navigate(`/quotations/${response.data.id}`);
      }
      setMessage(response?.message || 'Saved');
      load();
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function savePrices() {
    await run(() => send('put', `${base}/${id}`, {
      clientId: record.clientId,
      header: record.header,
      currency: record.currency,
      quotationDate: dateInput(record.quotationDate),
      invoiceDate: dateInput(record.invoiceDate),
      dueDate: dateInput(record.dueDate),
      validUntil: dateInput(record.validUntil),
      poSoNumber: record.poSoNumber || '',
      salutation: record.salutation,
      message: record.message,
      closing: record.closing,
      signatory: record.signatory,
      terms: record.terms,
      notes: record.notes || '',
      validityText: record.validityText,
      paymentTerms: record.paymentTerms,
      additionalCharges: record.additionalCharges || '0.00',
      items: record.items.map((item, index) => ({
        name: item.name,
        description: item.description || '',
        sectionHeading: item.sectionHeading || '',
        quantity: item.quantity,
        unit: item.unit || '',
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount || '0',
        taxRate: item.taxRate || '0',
        sortOrder: index,
        productId: item.productId || null,
        categoryId: item.categoryId || null,
      })),
    }));
  }

  if (!record) return <Notice error={error || 'Loading…'} />;
  const editable = kind === 'quotation' ? !record.convertedInvoiceId : record.status === 'Draft';

  return (
    <div>
      <PageHeader title={`${record.header || ''} ${record.number}`.trim()}>
        {editable ? <Link to={`${base}/${id}/edit`}><Button tone="secondary">Edit</Button></Link> : null}
        <Button tone="secondary" onClick={() => openPdf(`${base}/${id}/pdf`, `${record.number}.pdf`, false)}>Download PDF</Button>
        <Button tone="secondary" onClick={() => openPdf(`${base}/${id}/pdf`, `${record.number}.pdf`, true)}>Print</Button>
      </PageHeader>
      <Notice error={error} message={message} />
      <Panel className="mb-4 grid gap-2 text-sm md:grid-cols-2">
        <p><span className="text-stone-500">Client</span><br />{record.clientSnapshot?.name}</p>
        <p><span className="text-stone-500">Status</span><br /><StatusBadge status={record.status} /></p>
        <p><span className="text-stone-500">Date</span><br />{prettyDate(record.quotationDate || record.invoiceDate)}</p>
        <p><span className="text-stone-500">Grand total</span><br />{inr(record.grandTotal, record.currency)}</p>
        {kind === 'invoice' ? <p><span className="text-stone-500">Balance due</span><br />{inr(record.balanceDue, record.currency)}</p> : null}
      </Panel>
      <Panel className="mb-4 overflow-x-auto">
        <table className="responsive-table w-full text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="py-2">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {groupSections(record.items).map((group) => (
              <Fragment key={group.heading}>
                <tr className="border-t border-stone-300 bg-stone-50">
                  <td className="py-2 font-semibold" colSpan={4}>{group.heading}</td>
                </tr>
                {group.items.map((item) => (
                  <tr key={item._id || item.name} className="border-t border-stone-100 align-top">
                    <td className="py-2 pl-4" data-label="Item">{item.name}</td>
                    <td className="py-2 text-right" data-label="Qty">{item.quantity}{item.unit ? ` ${item.unit}` : ''}</td>
                    <td className="py-2 text-right" data-label="Price">
                      {editable ? (
                        <input
                          className="w-28 rounded border border-stone-300 px-2 py-1 text-right"
                          value={item.unitPrice}
                          onChange={(event) => setRecord({
                            ...record,
                            items: record.items.map((row) => (row._id === item._id ? { ...row, unitPrice: event.target.value } : row)),
                          })}
                        />
                      ) : inr(item.unitPrice, record.currency)}
                    </td>
                    <td className="py-2 text-right" data-label="Total">{inr(previewLine(item), record.currency)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
        {editable ? <Button className="mt-3" onClick={savePrices}>Save point prices</Button> : null}
        <div className="mt-3 text-right text-sm">
          <p>Subtotal {inr(record.subtotal, record.currency)}</p>
          {Number(record.discountTotal) > 0 ? <p>Discount {inr(record.discountTotal, record.currency)}</p> : null}
          {Number(record.taxTotal) > 0 ? <p>Tax {inr(record.taxTotal, record.currency)}</p> : null}
          <p className="font-semibold">Grand total {inr(record.grandTotal, record.currency)}</p>
        </div>
      </Panel>
      {kind === 'quotation' ? (
        <div className="flex flex-wrap gap-2">
          <select className={controlClass} value={record.status} disabled={record.status === 'Converted'} onChange={(event) => run(() => send('patch', `/quotations/${id}/status`, { status: event.target.value }))}>
            {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].map((status) => <option key={status}>{status}</option>)}
          </select>
          <Button tone="secondary" onClick={async () => {
            const response = await run(() => send('post', `/quotations/${id}/duplicate`));
            if (response?.data?.id) navigate(`/quotations/${response.data.id}`);
          }}>Duplicate</Button>
          {record.status === 'Accepted' && !record.convertedInvoiceId ? (
            <Button onClick={async () => {
              const response = await run(() => send('post', `/quotations/${id}/convert`));
              if (response?.data?.id) navigate(`/invoices/${response.data.id}`);
            }}>Convert to invoice</Button>
          ) : null}
          <Button tone="danger" onClick={async () => {
            const response = await run(() => send('delete', `/quotations/${id}`));
            if (response) navigate('/quotations');
          }}>Archive</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {record.status === 'Draft' ? <Button onClick={() => run(() => send('post', `/invoices/${id}/issue`))}>Issue invoice</Button> : null}
            {record.status !== 'Cancelled' ? <Button tone="danger" onClick={() => run(() => send('post', `/invoices/${id}/cancel`))}>Cancel invoice</Button> : null}
          </div>
          {record.status !== 'Draft' && record.status !== 'Cancelled' && record.status !== 'Paid' ? (
            <Panel>
              <h2 className="mb-3 font-semibold">Record payment</h2>
              <div className="grid gap-2 md:grid-cols-4">
                <Field label="Amount"><input className={controlClass} value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} /></Field>
                <Field label="Date"><input type="date" className={controlClass} value={payment.paymentDate} onChange={(event) => setPayment({ ...payment, paymentDate: event.target.value })} /></Field>
                <Field label="Method"><input className={controlClass} value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })} /></Field>
                <Field label="Reference"><input className={controlClass} value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></Field>
              </div>
              <Button className="mt-3" onClick={() => run(() => send('post', `/invoices/${id}/payments`, payment))}>Save payment</Button>
            </Panel>
          ) : null}
          <Panel>
            <h2 className="mb-2 font-semibold">Payments</h2>
            {(record.payments || []).length === 0 ? <Empty>No payments yet.</Empty> : record.payments.map((row) => (
              <div key={row.id} className="flex justify-between border-t border-stone-100 py-2 text-sm">
                <span>{prettyDate(row.paymentDate)} · {row.method}</span>
                <span>{inr(row.amount, record.currency)}</span>
              </div>
            ))}
          </Panel>
        </div>
      )}
    </div>
  );
}
