import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout"; // ← thêm

import HomePage from "../pages/home/HomePage";
import ProductListPage from "../pages/product/ProductListPage";
import ProductDetailPage from "../pages/product/ProductDetailPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CartPage from "../pages/cart/CartPage";
import CheckoutPage from "../pages/cart/CheckoutPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminPromotionsPage from "../pages/admin/AdminPromotionsPage";



import AdminGuard from "../components/guards/AdminGuard";
import UserGuard from "../components/guards/UserGuard";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import UserOrdersPage from "../pages/user/UserOrdersPage";
// Wrapper để dùng AdminLayout với <Route element>
function AdminRoute({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── User protected routes ── */}
          <Route
            path="/cart"
            element={
              <UserGuard>
                <CartPage />
              </UserGuard>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserGuard>
                <CheckoutPage />
              </UserGuard>
            }
          />
          <Route
            path="/user/orders"
            element={
              <UserGuard>
                <UserOrdersPage />
              </UserGuard>
            }
          />
          <Route
            path="/user/orders/:id"
            element={
              <UserGuard>
                <UserOrdersPage />
              </UserGuard>
            }
          />
        </Route>

        {/* ── Admin protected routes ── */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <AdminDashboardPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminGuard>
              <AdminProductsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminGuard>
              <AdminCategoriesPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminGuard>
              <AdminOrdersPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <AdminGuard>
              <AdminPromotionsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminGuard>
              <AdminUsersPage />
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
