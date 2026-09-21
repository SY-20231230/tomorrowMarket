import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import HomePage from "../pages/HomePage";
import StockDetailPage from "../pages/StockDetailPage";
import StockListPage from "../pages/StockListPage";
import MarketPage from "../pages/MarketPage";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import MyPage from "../pages/MyPage";
import AdminPage from "../pages/AdminPage";
import ScrollToTop from "../components/common/ScrollToTop";

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/home" element={<HomePage />} />
          <Route path="/stock/:code" element={<StockDetailPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/stocks" element={<StockListPage />} />
          <Route path="/stocks/:id" element={<StockDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;