import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HomePage from "../pages/HomePage";
import StockDetailPage from "../pages/StockDetailPage";
import SectorPage from "../pages/SectorPage";
import SectorPredictionPage from "../pages/SectorPredictionPage";
import MarketPage from "../pages/MarketPage";
import MyPage from "../pages/MyPage";
import MockInvestPage from "../pages/MockInvestPage";
import AdminPage from "../pages/AdminPage";

function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/stock/:code" element={<StockDetailPage />} />
          <Route path="/sector" element={<SectorPage />} />
          <Route path="/sector/prediction/:sectorId" element={<SectorPredictionPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mock-invest" element={<MockInvestPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRouter;