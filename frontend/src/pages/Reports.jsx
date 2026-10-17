import { useEffect, useState } from 'react';
import { exportUrl, getData } from '../api';
import { inr } from '../lib/format';
import { Button, Empty, Notice, PageHeader, Panel, controlClass } from '../components/ui';

const reports = [
  ['quotations', 'Quotations'],
  ['quotation-outcomes', 'Accepted vs rejected'],
  ['conversion', 'Conversion'],
  ['sales', 'Invoice sales'],
  ['payments', 'Payments'],
  ['outstanding', 'Outstanding'],
  ['overdue', 'Overdue'],
  ['clients', 'Client sales'],
  ['products', 'Product sales'],
  ['revenue', 'Revenue'],
];

export default function Reports() {
  const [slug, setSlug] = useState('quotations');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getData(`/reports/${slug}`, { from, to }).then((response) => setData(response.data)).catch((err) => setError(err.message));
  }, [slug, from, to]);

  const rows = data?.rows || [];
  const columns = rows[0] ? Object.keys(rows[0]).filter((key) => key !== 'id') : [];

  return (
    <div>
      <PageHeader title="Reports">
        <a href={exportUrl(slug, { from, to })}><Button tone="secondary">Download CSV</Button></a>
      </PageHeader>
      <Notice error={error} />
      <div className="mb-4 flex flex-wrap gap-2">
        <select className={`${controlClass} max-w-xs`} value={slug} onChange={(event) => setSlug(event.target.value)}>
          {reports.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input type="date" className={controlClass} value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" className={controlClass} value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
      {data ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Panel><p className="text-xs text-stone-500">Issued sales</p><p className="text-xl font-semibold">{inr(data.issuedSales || 0)}</p></Panel>
          <Panel><p className="text-xs text-stone-500">Paid</p><p className="text-xl font-semibold">{inr(data.paidAmount || data.yearlyTotal || 0)}</p></Panel>
          <Panel><p className="text-xs text-stone-500">Outstanding</p><p className="text-xl font-semibold">{inr(data.outstanding || 0)}</p></Panel>
        </div>
      ) : null}
      {!rows.length && !data?.accepted ? <Empty>No rows for this range.</Empty> : null}
      {rows.length ? (
        <Panel className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500"><tr>{columns.map((column) => <th key={column} className="py-2 pr-3">{column}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index} className="border-t border-stone-100">
                  {columns.map((column) => <td key={column} className="py-2 pr-3">{formatCell(column, row[column])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : null}
      {data && data.accepted !== undefined && !rows.length ? (
        <Panel>
          <p>Accepted {data.accepted}</p>
          <p>Rejected {data.rejected || 0}</p>
          <p>Converted {data.converted || 0}</p>
        </Panel>
      ) : null}
    </div>
  );
}

function formatCell(column, value) {
  if (value === null || value === undefined) return '—';
  if (['total', 'amount', 'issuedSales', 'paidAmount', 'outstanding', 'balanceDue', 'amountPaid', 'grandTotal'].includes(column)) {
    return inr(value);
  }
  if (typeof value === 'string' && value.includes('T') && value.endsWith('Z')) return value.slice(0, 10);
  return String(value);
}
