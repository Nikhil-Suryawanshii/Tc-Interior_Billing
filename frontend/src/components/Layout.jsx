import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  ['/', 'Dashboard'],
  ['/quotations', 'Quotations'],
  ['/invoices', 'Invoices'],
  ['/clients', 'Clients'],
  ['/products', 'Products & Services'],
  ['/categories', 'Categories'],
  ['/payments', 'Payments'],
  ['/reports', 'Reports'],
  ['/settings', 'Company Settings'],
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className={`bg-stone-900 text-stone-100 ${open ? 'block' : 'hidden'} md:block`}>
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs tracking-[0.18em] text-stone-400">STUDIO</p>
          <p className="mt-1 text-sm font-semibold leading-5">THE CONCEPT DESIGNERS</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-white text-stone-900' : 'text-stone-200 hover:bg-white/10'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <p className="text-sm font-semibold">THE CONCEPT DESIGNERS</p>
          <button className="rounded-md border border-stone-300 px-3 py-1 text-sm" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
