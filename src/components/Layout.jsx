import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { configured } from "../lib/supabase.js";

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-semibold transition ${
    isActive ? "bg-brand/10 text-brand" : "text-neutral-600 hover:text-neutral-900"
  }`;

export default function Layout() {
  const { user, signOut } = useAuth();
  const name = user?.email?.split("@")[0];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">Р</span>
          РешуМагу
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navClass}>Главная</NavLink>
          <NavLink to="/profile" className={navClass}>Кабинет</NavLink>
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold sm:inline">{name}</span>
            <button onClick={signOut} className="btn-dark">Выйти</button>
          </div>
        ) : (
          <Link to="/auth" className="btn-accent">Войти</Link>
        )}
      </header>

      {!configured && (
        <div className="mx-auto mb-4 w-full max-w-6xl px-4">
          <div className="rounded-2xl bg-amber-100 p-4 text-sm font-semibold text-amber-900">
            Не заданы переменные VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY. Добавьте их
            в Netlify (Project configuration → Environment variables) и пересоберите сайт.
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
        РешуМагу · Онлайн-платформа подготовки к вступительным экзаменам в магистратуру · © 2026
      </footer>
    </div>
  );
}
