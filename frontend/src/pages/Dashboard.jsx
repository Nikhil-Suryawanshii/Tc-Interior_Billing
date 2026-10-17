import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getData } from '../api';
import { inr, prettyDate } from '../lib/format';
import { Button, Empty, Notice, PageHeader, Panel, StatusBadge } from '../components/ui';

export default function Dashboard() {
  const [company, setCompany] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  function load() {
    setError('');
    Promise.all([getData('/company'), getData('/dashboard')])
      .then(([companyResponse, dashboardResponse]) => {
        setCompany(companyResponse.data);
        setData(dashboardResponse.data);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  const cards = data
    ? [
        ['Clients', data.clients],
        ['Products', data.products],
        ['Quotations', data.quotations],
        ['Accepted', data.quotationsAccepted],
        ['Pending', data.quotationsPending],
        ['Rejected', data.quotationsRejected],
        ['Expired', data.quotationsExpired],
        ['Invoices', data.invoices],
        ['Paid', data.invoicesPaid],
        ['Unpaid', data.invoicesUnpaid],
        ['Partial', data.invoicesPartial],
        ['Outstanding', inr(data.outstandingAmount)],
        ['Received', inr(data.revenueReceived)],
      ]
    : [];

  return (
    <div>
      <PageHeader title="Dashboard">
        <Link to="/quotations/new"><Button>New quotation</Button></Link>
        <Link to="/invoices/new"><Button tone="secondary">New invoice</Button></Link>
        <Link to="/clients/new"><Button tone="secondary">Add client</Button></Link>
      </PageHeader>
      <Notice error={error} />
      <div className="mb-6 flex items-center gap-3">
        {company?.logoUrl ? <img src={company.logoUrl} alt="" className="h-12 w-12 rounded-md object-contain" /> : null}
        <div>
          <p className="text-lg font-semibold">{company?.name || 'THE CONCEPT DESIGNERS'}</p>
          <p className="text-sm text-stone-500">{company?.addressLine1}</p>
        </div>
      </div>
      {!data ? <p className="text-sm text-stone-500">Loading dashboard…</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <Panel key={label}>
            <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </Panel>
        ))}
      </div>
      {data ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="mb-3 font-semibold">Monthly revenue</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue.map((row) => ({ ...row, amount: Number(row.amount) }))}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#9a3412" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-semibold">Quotation conversion</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Accepted', count: data.conversion.accepted },
                  { name: 'Rejected', count: data.conversion.rejected },
                  { name: 'Converted', count: data.conversion.converted },
                ]}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#44403c" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Recent title="Recent quotations" rows={data.recentQuotations} base="/quotations" />
          <Recent title="Recent invoices" rows={data.recentInvoices} base="/invoices" />
          <Panel className="lg:col-span-2">
            <h2 className="mb-3 font-semibold">Outstanding payments</h2>
            {data.outstandingSummary.length === 0 ? <Empty>No outstanding balance.</Empty> : (
              <ul className="divide-y divide-stone-100 text-sm">
                {data.outstandingSummary.map((row) => (
                  <li key={row.id} className="flex justify-between py-2">
                    <span>{row.number} · {row.clientName}</span>
                    <span>{inr(row.balanceDue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

function Recent({ title, rows, base }) {
  return (
    <Panel>
      <h2 className="mb-3 font-semibold">{title}</h2>
      {rows.length === 0 ? <Empty>Nothing yet.</Empty> : (
        <ul className="divide-y divide-stone-100 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-2 py-2">
              <Link to={`${base}/${row.id}`} className="font-medium hover:underline">{row.number}</Link>
              <span className="text-stone-500">{row.clientName}</span>
              <span>{prettyDate(row.date)}</span>
              <StatusBadge status={row.status} />
              <span>{inr(row.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
