import { Routes, Route } from 'react-router-dom'
import AnnouncementBar from './components/layout/AnnouncementBar.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import Login from './pages/Login.jsx'
import Account from './pages/Account.jsx'
import Orders from './pages/Orders.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return <div className="flex min-h-screen flex-col"><AnnouncementBar/><Navbar/><main className="flex-1"><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/shop" element={<Shop/>}/><Route path="/product/:id" element={<ProductDetail/>}/><Route path="/cart" element={<Cart/>}/><Route path="/login" element={<Login/>}/><Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>}/><Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess/></ProtectedRoute>}/><Route path="/account" element={<ProtectedRoute><Account/></ProtectedRoute>}/><Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>}/><Route path="/admin" element={<ProtectedRoute adminOnly><Admin/></ProtectedRoute>}/></Routes></main><Footer/></div>
}
