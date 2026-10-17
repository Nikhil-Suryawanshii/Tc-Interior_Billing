import { useEffect, useState } from 'react';
import { getData, send } from '../api';
import { inr, prettyDate } from '../lib/format';
import { Button, Empty, Notice, PageHeader, Panel } from '../components/ui';

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  function load() {
    getData('/payments', { perPage: 50 }).then((response) => setRows(response.data)).catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function remove(id) {
    if (!window.confirm('Remove this payment?')) return;
    try {
      await send('delete', `/payments/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Payments" />
      <Notice error={error} />
      {rows.length === 0 ? <Empty>No payments recorded.</Empty> : (
        <Panel>
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 py-3 text-sm">
              <span className="font-medium">{row.invoiceNumber}</span>
              <span>{row.clientName}</span>
              <span>{prettyDate(row.paymentDate)}</span>
              <span>{row.method}</span>
              <span>{inr(row.amount)}</span>
              <Button tone="danger" onClick={() => remove(row.id)}>Remove</Button>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
