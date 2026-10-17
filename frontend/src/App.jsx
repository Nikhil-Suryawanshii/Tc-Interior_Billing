import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ClientDetail, ClientForm, Clients } from './pages/Clients';
import { Categories, ProductForm, Products } from './pages/Catalog';
import { InvoiceEditor, InvoiceList, InvoiceView, QuotationEditor, QuotationList, QuotationView } from './pages/Documents';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'clients', element: <Clients /> },
      { path: 'clients/new', element: <ClientForm /> },
      { path: 'clients/:id', element: <ClientDetail /> },
      { path: 'clients/:id/edit', element: <ClientForm /> },
      { path: 'categories', element: <Categories /> },
      { path: 'products', element: <Products /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:id/edit', element: <ProductForm /> },
      { path: 'quotations', element: <QuotationList /> },
      { path: 'quotations/new', element: <QuotationEditor /> },
      { path: 'quotations/:id', element: <QuotationView /> },
      { path: 'quotations/:id/edit', element: <QuotationEditor /> },
      { path: 'invoices', element: <InvoiceList /> },
      { path: 'invoices/new', element: <InvoiceEditor /> },
      { path: 'invoices/:id', element: <InvoiceView /> },
      { path: 'invoices/:id/edit', element: <InvoiceEditor /> },
      { path: 'payments', element: <Payments /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
