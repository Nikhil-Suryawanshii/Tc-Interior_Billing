import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getData, send, upload } from '../api';
import { inr } from '../lib/format';
import { Button, Empty, Field, Notice, PageHeader, Panel, controlClass } from '../components/ui';
import { Pager } from './Clients';

export function Categories() {
  const [rows, setRows] = useState([]);
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const parents = rows.filter((row) => !row.parentId);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await getData('/categories');
      setRows(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function startCreate(parentId = '') {
    setError('');
    setMessage('');
    const siblingCount = parentId
      ? rows.filter((row) => row.parentId === parentId).length
      : parents.length;
    setEditor({
      id: '',
      parentId,
      name: '',
      description: '',
      defaultPrice: '0.00',
      sortOrder: siblingCount + 1,
      isActive: true,
    });
  }

  function startEdit(category) {
    setError('');
    setMessage('');
    setEditor({
      id: category.id,
      parentId: category.parentId || '',
      name: category.name || '',
      description: category.description || '',
      defaultPrice: category.defaultPrice || '0.00',
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive !== false,
    });
  }

  async function saveCategory(event) {
    event.preventDefault();
    if (!editor) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editor.name.trim(),
        description: editor.description,
        sortOrder: Number(editor.sortOrder) || 0,
        isActive: editor.isActive,
      };
      if (editor.parentId) {
        payload.parentId = editor.parentId;
        payload.defaultPrice = editor.defaultPrice || '0.00';
      }
      const response = await send(editor.id ? 'put' : 'post', editor.id ? `/categories/${editor.id}` : '/categories', payload);
      setEditor(null);
      setMessage(response.message || (editor.id ? 'Category updated.' : 'Category created.'));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(category) {
    const kind = category.parentId ? 'category point' : 'main category';
    if (!window.confirm(`Delete this ${kind}? This cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      const response = await send('delete', `/categories/${category.id}`);
      setMessage(response.message || 'Category deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Categories">
        <Button type="button" onClick={() => startCreate()}>Add main category</Button>
      </PageHeader>
      <Notice error={error} message={message} />

      {loading ? <Empty>Loading categories…</Empty> : parents.length === 0 ? (
        <Empty>No categories yet. Add a main category to get started.</Empty>
      ) : (
        <div className="space-y-4">
          {parents
            .slice()
            .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name))
            .map((parent) => {
              const children = rows
                .filter((row) => row.parentId === parent.id)
                .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
              return (
                <Panel key={parent.id} className="overflow-hidden p-0">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-lg text-white">▦</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-stone-900">{parent.name}</h2>
                          <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">Main category</span>
                          <CategoryState active={parent.isActive} />
                        </div>
                        {parent.description ? <p className="mt-1 text-sm text-stone-600">{parent.description}</p> : <p className="mt-1 text-xs text-stone-400">No description</p>}
                        <p className="mt-1 text-xs text-stone-500">Display order: {parent.sortOrder ?? 0} · {children.length} {children.length === 1 ? 'point' : 'points'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" tone="secondary" onClick={() => startCreate(parent.id)}>Add point</Button>
                      <Button type="button" tone="secondary" onClick={() => startEdit(parent)}>Edit</Button>
                      <Button type="button" tone="danger" onClick={() => remove(parent)}>Delete</Button>
                    </div>
                  </div>

                  {children.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-stone-500">No points in this category yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left text-sm">
                        <thead className="bg-white text-xs uppercase tracking-wide text-stone-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Category point</th>
                            <th className="px-4 py-3 font-medium">Default price</th>
                            <th className="px-4 py-3 font-medium">Order</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {children.map((point) => (
                            <tr key={point.id} className="border-t border-stone-100 hover:bg-stone-50">
                              <td className="px-4 py-3">
                                <span className="mr-2 text-stone-300">└</span>
                                <span className="font-medium text-stone-800">{point.name}</span>
                                {point.description ? <span className="mt-1 block pl-6 text-xs text-stone-500">{point.description}</span> : null}
                              </td>
                              <td className="px-4 py-3">{inr(point.defaultPrice || '0.00')}</td>
                              <td className="px-4 py-3 text-stone-600">{point.sortOrder ?? 0}</td>
                              <td className="px-4 py-3"><CategoryState active={point.isActive} /></td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <Button type="button" tone="secondary" onClick={() => startEdit(point)}>Edit</Button>
                                  <Button type="button" tone="danger" onClick={() => remove(point)}>Delete</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              );
            })}
        </div>
      )}

      {editor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditor(null); }}>
          <form onSubmit={saveCategory} className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="category-editor-title">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 id="category-editor-title" className="text-lg font-semibold text-stone-900">
                {editor.id ? 'Edit category' : editor.parentId ? 'Add category point' : 'Add main category'}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {editor.parentId ? `Under ${rows.find((row) => row.id === editor.parentId)?.name || 'selected category'}` : 'Main categories group related work and service points.'}
              </p>
            </div>
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
              <Field label="Name">
                <input autoFocus required className={controlClass} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} />
              </Field>
              {editor.parentId ? (
                <Field label="Default price (₹)">
                  <input type="number" min="0" step="0.01" className={controlClass} value={editor.defaultPrice} onChange={(event) => setEditor({ ...editor, defaultPrice: event.target.value })} />
                </Field>
              ) : null}
              <Field label="Display order">
                <input type="number" min="0" className={controlClass} value={editor.sortOrder} onChange={(event) => setEditor({ ...editor, sortOrder: event.target.value })} />
              </Field>
              <div className={editor.parentId ? '' : 'sm:col-span-2'}>
                <Field label="Description">
                  <textarea rows={editor.parentId ? 2 : 3} className={controlClass} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-700 sm:col-span-2">
                <input type="checkbox" checked={editor.isActive} onChange={(event) => setEditor({ ...editor, isActive: event.target.checked })} />
                Active and available when creating documents
              </label>
            </div>
            {error ? <p className="mx-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
            <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-4">
              <Button type="button" tone="secondary" disabled={saving} onClick={() => setEditor(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editor.id ? 'Save changes' : 'Create category'}</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function CategoryState({ active }) {
  return active === false
    ? <span className="inline-flex rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600">Inactive</span>
    : <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Active</span>;
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
