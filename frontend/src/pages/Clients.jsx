import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getData, send } from '../api';
import { inr, prettyDate } from '../lib/format';
import { Button, Empty, Field, Notice, PageHeader, Panel, StatusBadge, controlClass } from '../components/ui';

const emptyClient = {
  name: '',
  gstNumber: '',
  phone: '',
  email: '',
  attentionName: '',
  billingAddress: '',
  shippingAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  notes: '',
};

export function Clients() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getData('/clients', { search, page })
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [search, page]);

  return (
    <div>
      <PageHeader title="Clients">
        <Link to="/clients/new"><Button>Add client</Button></Link>
      </PageHeader>
      <Notice error={error} />
      <input className={`${controlClass} mb-4 max-w-sm`} placeholder="Search name, phone, or email" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
      {!result?.data?.length ? <Empty>No clients yet.</Empty> : (
        <Panel className="overflow-x-auto">
          <table className="responsive-table w-full text-left text-sm">
            <thead className="text-stone-500"><tr><th className="py-2">Name</th><th>Phone</th><th>Email</th><th>City</th></tr></thead>
            <tbody>
              {result.data.map((client) => (
                <tr key={client.id} className="border-t border-stone-100">
                  <td className="py-2" data-label="Name"><Link className="font-medium hover:underline" to={`/clients/${client.id}`}>{client.name}</Link></td>
                  <td data-label="Phone">{client.phone}</td>
                  <td data-label="Email">{client.email}</td>
                  <td data-label="City">{client.city}</td>
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

export function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyClient);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getData(`/clients/${id}`).then((response) => setForm(response.data)).catch((err) => setError(err.message));
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    try {
      const response = await send(id ? 'put' : 'post', id ? `/clients/${id}` : '/clients', form);
      navigate(`/clients/${response.data.id}`);
    } catch (err) {
      setError(err.message);
      setErrors(err.errors || {});
    }
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit client' : 'New client'} />
      <Notice error={error} />
      <Panel className="grid gap-3 md:grid-cols-2">
        {Object.entries({
          name: 'Name',
          gstNumber: 'GST',
          phone: 'Phone',
          email: 'Email',
          attentionName: 'Attention',
          city: 'City',
          state: 'State',
          postalCode: 'Postal code',
          country: 'Country',
        }).map(([key, label]) => (
          <Field key={key} label={label} error={errors[key]}>
            <input className={controlClass} value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          </Field>
        ))}
        <Field label="Billing address"><textarea className={controlClass} rows={3} value={form.billingAddress} onChange={(event) => setForm({ ...form, billingAddress: event.target.value })} /></Field>
        <Field label="Shipping or project address"><textarea className={controlClass} rows={3} value={form.shippingAddress} onChange={(event) => setForm({ ...form, shippingAddress: event.target.value })} /></Field>
        <Field label="Notes"><textarea className={`${controlClass} md:col-span-2`} rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
      </Panel>
      <Button className="mt-4" type="submit">Save client</Button>
    </form>
  );
}

export function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getData(`/clients/${id}`), getData(`/clients/${id}/history`)])
      .then(([clientResponse, historyResponse]) => {
        setClient(clientResponse.data);
        setHistory(historyResponse.data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function remove() {
    if (!window.confirm('Delete this client?')) return;
    try {
      await send('delete', `/clients/${id}`);
      navigate('/clients');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!client) return <Notice error={error || 'Loading client…'} />;

  return (
    <div>
      <PageHeader title={client.name}>
        <Link to={`/clients/${id}/edit`}><Button tone="secondary">Edit</Button></Link>
        <Button tone="danger" onClick={remove}>Delete</Button>
      </PageHeader>
      <Notice error={error} />
      <Panel className="mb-4 text-sm leading-6">
        <p>{client.attentionName}</p>
        <p>{client.phone} · {client.email}</p>
        <p>{client.billingAddress}</p>
        <p>{[client.city, client.state, client.postalCode, client.country].filter(Boolean).join(', ')}</p>
        {client.gstNumber ? <p>GST {client.gstNumber}</p> : null}
        {client.notes ? <p className="mt-2 text-stone-600">{client.notes}</p> : null}
      </Panel>
      <History title="Quotations" rows={history?.quotations || []} href="/quotations" />
      <History title="Invoices" rows={history?.invoices || []} href="/invoices" />
      <Panel>
        <h2 className="mb-2 font-semibold">Payments</h2>
        {(history?.payments || []).length === 0 ? <Empty>No payments.</Empty> : history.payments.map((payment) => (
          <p key={payment.id} className="text-sm">{payment.invoiceNumber} · {prettyDate(payment.paymentDate)} · {inr(payment.amount)}</p>
        ))}
      </Panel>
    </div>
  );
}

function History({ title, rows, href }) {
  return (
    <Panel className="mb-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      {rows.length === 0 ? <Empty>None yet.</Empty> : rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3 border-t border-stone-100 py-2 text-sm">
          <Link to={`${href}/${row.id}`} className="font-medium hover:underline">{row.number}</Link>
          <StatusBadge status={row.status} />
          <span>{inr(row.grandTotal)}</span>
        </div>
      ))}
    </Panel>
  );
}

export function Pager({ page, total, perPage, onPage }) {
  const pages = Math.max(Math.ceil(total / perPage), 1);
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center gap-2 text-sm">
      <Button tone="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
      <span>{page} / {pages}</span>
      <Button tone="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
    </div>
  );
}
