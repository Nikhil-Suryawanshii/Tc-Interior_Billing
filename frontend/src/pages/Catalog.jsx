import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getData, send, upload } from '../api';
import { inr } from '../lib/format';
import { Button, Empty, Field, Notice, PageHeader, Panel, controlClass } from '../components/ui';
import { Pager } from './Clients';

export function Categories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0, isActive: true });
  const [points, setPoints] = useState({});
  const [error, setError] = useState('');
  const parents = rows.filter((row) => !row.parentId);

  function load() {
    getData('/categories').then((response) => setRows(response.data)).catch((err) => setError(err.message));
  }
  useEffect(load, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await send('post', '/categories', form);
      setForm({ name: '', description: '', sortOrder: 0, isActive: true });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addPoint(parentId) {
    const draft = points[parentId] || { name: '', defaultPrice: '0.00' };
    try {
      await send('post', '/categories', { name: draft.name, defaultPrice: draft.defaultPrice, parentId, sortOrder: rows.filter((row) => row.parentId === parentId).length + 1 });
      setPoints({ ...points, [parentId]: { name: '', defaultPrice: '0.00' } });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePointPrice(point) {
    try {
      await send('put', `/categories/${point.id}`, { defaultPrice: point.defaultPrice });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await send('delete', `/categories/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Categories" />
      <Notice error={error} />
      <form onSubmit={submit} className="mb-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input className={controlClass} placeholder="Category name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input className={controlClass} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <Button type="submit">Add category</Button>
      </form>
      <div className="space-y-4">
        {parents.map((parent) => {
          const children = rows.filter((row) => row.parentId === parent.id).sort((a, b) => a.sortOrder - b.sortOrder);
          const draft = points[parent.id] || { name: '', defaultPrice: '0.00' };
          return (
            <Panel key={parent.id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">{parent.name}</h2>
                <Button tone="danger" onClick={() => remove(parent.id)}>Delete</Button>
              </div>
              {children.length === 0 ? <Empty>No points yet.</Empty> : children.map((point) => (
                <div key={point.id} className="grid grid-cols-[1fr_9rem_auto] items-center gap-2 border-t border-stone-100 py-2 text-sm">
                  <span>{point.name}</span>
                  <input
                    className={controlClass}
                    value={point.defaultPrice || '0.00'}
                    onChange={(event) => setRows(rows.map((row) => (row.id === point.id ? { ...row, defaultPrice: event.target.value } : row)))}
                    onBlur={() => savePointPrice(point)}
                  />
                  <Button tone="danger" onClick={() => remove(point.id)}>Delete</Button>
                </div>
              ))}
              <div className="mt-3 grid grid-cols-[1fr_9rem_auto] gap-2">
                <input className={controlClass} placeholder="Point name" value={draft.name} onChange={(event) => setPoints({ ...points, [parent.id]: { ...draft, name: event.target.value } })} />
                <input className={controlClass} placeholder="Price" value={draft.defaultPrice} onChange={(event) => setPoints({ ...points, [parent.id]: { ...draft, defaultPrice: event.target.value } })} />
                <Button type="button" onClick={() => addPoint(parent.id)}>Add point</Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

export function Products() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    getData('/categories').then((response) => setCategories(response.data)).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    getData('/products', { search, categoryId, page, isActive: 'all' })
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [search, categoryId, page]);

  return (
    <div>
      <PageHeader title="Products & Services">
        <Link to="/products/new"><Button>Add product</Button></Link>
      </PageHeader>
      <Notice error={error} />
      <div className="mb-4 flex flex-wrap gap-2">
        <input className={`${controlClass} max-w-xs`} placeholder="Search name or SKU" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
        <select className={`${controlClass} max-w-xs`} value={categoryId} onChange={(event) => { setPage(1); setCategoryId(event.target.value); }}>
          <option value="">All categories</option>
          {categories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
      {!result?.data?.length ? <Empty>No products yet.</Empty> : (
        <Panel className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500"><tr><th className="py-2">Name</th><th>SKU</th><th>Price</th><th>Active</th></tr></thead>
            <tbody>
              {result.data.map((product) => (
                <tr key={product.id} className="border-t border-stone-100">
                  <td className="py-2"><Link className="font-medium hover:underline" to={`/products/${product.id}/edit`}>{product.name}</Link></td>
                  <td>{product.sku}</td>
                  <td>{inr(product.sellingPrice)}</td>
                  <td>{product.isActive ? 'Yes' : 'No'}</td>
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

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', description: '', categoryId: '', unit: 'job', sellingPrice: '0.00', costPrice: '', taxRate: '0.00', isActive: true });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getData('/categories').then((response) => setCategories(response.data)).catch(() => {});
    if (!id) return;
    getData(`/products/${id}`).then((response) => setForm(response.data)).catch((err) => setError(err.message));
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    try {
      const response = await send(id ? 'put' : 'post', id ? `/products/${id}` : '/products', form);
      if (file) await upload(`/products/${response.data.id}/image`, file);
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit product' : 'New product'} />
      <Notice error={error} />
      <Panel className="grid gap-3 md:grid-cols-2">
        <Field label="Name"><input className={controlClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="SKU"><input className={controlClass} value={form.sku || ''} onChange={(event) => setForm({ ...form, sku: event.target.value })} /></Field>
        <Field label="Category">
          <select className={controlClass} value={form.categoryId || ''} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">None</option>
            {categories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </Field>
        <Field label="Unit"><input className={controlClass} value={form.unit || ''} onChange={(event) => setForm({ ...form, unit: event.target.value })} /></Field>
        <Field label="Selling price"><input className={controlClass} value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} /></Field>
        <Field label="Cost price"><input className={controlClass} value={form.costPrice || ''} onChange={(event) => setForm({ ...form, costPrice: event.target.value })} /></Field>
        <Field label="Tax %"><input className={controlClass} value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: event.target.value })} /></Field>
        <Field label="Image"><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive !== false} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> Active</label>
        <Field label="Description"><textarea className={`${controlClass} md:col-span-2`} rows={4} value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      </Panel>
      <Button className="mt-4" type="submit">Save product</Button>
    </form>
  );
}
