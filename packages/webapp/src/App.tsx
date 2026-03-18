import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { usePageView } from "./hooks/usePageView.js";
import { TabBar } from "./components/TabBar.js";
import { LoginPage } from "./pages/LoginPage.js";
import { HomePage } from "./pages/HomePage.js";
import { EventsPage } from "./pages/EventsPage.js";
import { LoyaltyPage } from "./pages/LoyaltyPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { OnboardingPage } from "./pages/OnboardingPage.js";
import { StampsPage } from "./pages/StampsPage.js";
import { HistoryPage } from "./pages/HistoryPage.js";
import { MenuPage } from "./pages/MenuPage.js";
import { RestaurantsPage } from "./pages/RestaurantsPage.js";
import { CakesPage } from "./pages/CakesPage.js";
import { PartyPage } from "./pages/PartyPage.js";
import { CateringPage } from "./pages/CateringPage.js";
import { DealsPage } from "./pages/DealsPage.js";
import { ChatButton } from "./components/ChatButton.js";

// Pending registration state (after OTP verified, before form submitted)
interface PendingRegistration {
  tempToken: string;
  phone: string;
}

function AppRoutes() {
  usePageView();
  const { loading, registered } = useAuth();
  const [pendingReg, setPendingReg] = useState<PendingRegistration | null>(null);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🧁</div>
          <div style={{ color: "var(--color-text-secondary)" }}>Загружаем...</div>
        </div>
      </div>
    );
  }

  if (!registered) {
    // After OTP verified but not registered — show registration form
    if (pendingReg) {
      return <OnboardingPage tempToken={pendingReg.tempToken} phone={pendingReg.phone} />;
    }
    // Not authenticated — show login
    return <LoginPage onNeedRegistration={(tempToken, phone) => setPendingReg({ tempToken, phone })} />;
  }

  return (
    <>
      <div style={{ paddingBottom: "80px" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/loyalty" element={<LoyaltyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stamps" element={<StampsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/cakes" element={<CakesPage />} />
          <Route path="/party" element={<PartyPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ChatButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
