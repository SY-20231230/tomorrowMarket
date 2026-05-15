import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage"; // 추가
import HomePage from "../pages/HomePage";
import StockDetailPage from "../pages/StockDetailPage";
import SectorPage from "../pages/SectorPage";
import SectorPredictionPage from "../pages/SectorPredictionPage";
import MarketPage from "../pages/MarketPage";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import StockNewsAnalysisPage from "../pages/StockNewsAnalysisPage";
import MyPage from "../pages/MyPage";
import MockInvestPage from "../pages/MockInvestPage";
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
          <Route path="/home" element={<HomePage />} />
          <Route path="/stock/:code" element={<StockDetailPage />} />
          <Route path="/sector" element={<SectorPage />} />
          <Route path="/sector/prediction/:sectorId" element={<SectorPredictionPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/stock/:code/analysis" element={<StockNewsAnalysisPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mock-invest" element={<MockInvestPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;