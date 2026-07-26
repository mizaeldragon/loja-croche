import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'

import Home from './pages/public/Home'
import Shop from './pages/public/Shop'
import ProductDetail from './pages/public/ProductDetail'
import NotFound from './pages/public/NotFound'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'
import Testimonials from './pages/admin/Testimonials'
import Banners from './pages/admin/Banners'
import Settings from './pages/admin/Settings'
import Users from './pages/admin/Users'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/loja" element={<Shop />} />
          <Route path="/produto/:slug" element={<ProductDetail />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/produtos" element={<Products />} />
            <Route path="/admin/produtos/novo" element={<ProductForm />} />
            <Route path="/admin/produtos/:id/editar" element={<ProductForm />} />
            <Route path="/admin/categorias" element={<Categories />} />
            <Route path="/admin/pedidos" element={<Orders />} />
            <Route path="/admin/depoimentos" element={<Testimonials />} />
            <Route path="/admin/banners" element={<Banners />} />
            <Route path="/admin/usuarios" element={<Users />} />
            <Route path="/admin/configuracoes" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
