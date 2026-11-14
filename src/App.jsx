import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./lib/auth.jsx";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import University from "./pages/University.jsx";
import Exam from "./pages/Exam.jsx";
import Test from "./pages/Test.jsx";
import Result from "./pages/Result.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="py-20 text-center text-neutral-500">Загрузка…</p>;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<Auth />} />
        <Route path="u/:id" element={<University />} />
        <Route path="exam/:id" element={<Exam />} />
        <Route path="test/:attemptId" element={<Protected><Test /></Protected>} />
        <Route path="result/:attemptId" element={<Protected><Result /></Protected>} />
        <Route path="profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
