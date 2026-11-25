import { Navigate, Route, Routes } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationProvider.jsx';
import { InventoryProvider } from './context/InventoryContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductForm from './pages/ProductForm.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Categories from './pages/Categories.jsx';
import Suppliers from './pages/Suppliers.jsx';
import StockIn from './pages/StockIn.jsx';
import StockOut from './pages/StockOut.jsx';
import StockAdjustment from './pages/StockAdjustment.jsx';
import Transactions from './pages/Transactions.jsx';
import Reports from './pages/Reports.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <NotificationProvider>
      <InventoryProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="stock-in" element={<StockIn />} />
            <Route path="stock-out" element={<StockOut />} />
            <Route path="stock-adjustment" element={<StockAdjustment />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Navigate to="/reports/current-stock" replace />} />
            <Route path="reports/:type" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </InventoryProvider>
    </NotificationProvider>
  );
}
