import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./api.js";
import { Layout } from "./components/Layout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { UsersPage } from "./pages/UsersPage.js";
import { UserDetailPage } from "./pages/UserDetailPage.js";
import { EventsPage } from "./pages/EventsPage.js";
import { EventFormPage } from "./pages/EventFormPage.js";
import { TransactionsPage } from "./pages/TransactionsPage.js";
import { PartyRequestsPage } from "./pages/PartyRequestsPage.js";
import { PushPage } from "./pages/PushPage.js";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/:id" element={<UserDetailPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="events/new" element={<EventFormPage />} />
                  <Route path="events/:id/edit" element={<EventFormPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="party-requests" element={<PartyRequestsPage />} />
                  <Route path="push" element={<PushPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
