import { Link, NavLink, Outlet } from "react-router-dom";
import { displayName, useAuth } from "../lib/auth.jsx";
import { configured } from "../lib/supabase.js";
import logoHeader from "../assets/logo-header.png";
import logoFooter from "../assets/logo-footer.png";

const navClass = ({ isActive }) =>
  `rounded-full px-[22px] py-3 text-base transition ${
    isActive ? "bg-tint font-bold text-brand" : "font-semibold text-black hover:bg-tint/60"
  }`;

export default function Layout() {
  const { user, signOut } = useAuth();
  const name = displayName(user);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 md:px-20 md:pt-8">
        <header className="flex h-16 items-center justify-between rounded-full bg-white pl-5 pr-3 md:h-20 md:pl-8 md:pr-4">
          <Link to="/" className="flex shrink-0 items-center md:w-[300px]">
            <img src={logoHeader} alt="РешуМагу" className="h-9 w-auto md:h-[41px]" />
          </Link>

          <nav className="hidden items-center gap-1.5 md:flex">
            <NavLink to="/" end className={navClass}>Главная</NavLink>
            <NavLink to="/profile" className={navClass}>Кабинет</NavLink>
          </nav>

          <div className="flex items-center justify-end gap-3 md:w-[300px]">
            {user ? (
              <>
                <button
                  onClick={signOut}
                  className="hidden text-sm font-semibold text-muted hover:text-black sm:block"
                >
                  Выйти
                </button>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-full bg-paper py-1.5 pl-1.5 pr-5"
                >
                  <span className="grid size-10 place-items-center rounded-[20px] bg-brand font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate font-semibold">{name}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-accent px-9 py-3.5 text-base font-bold text-white transition hover:bg-accent/90"
              >
                Войти
              </Link>
            )}
          </div>
        </header>
      </div>

      {!configured && (
        <div className="mx-auto mt-4 w-full max-w-[1440px] px-4 md:px-20">
          <div className="rounded-2xl bg-amber-100 p-4 text-sm font-semibold text-amber-900">
            Не заданы переменные VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY. Добавьте их
            в Netlify (Project configuration → Environment variables) и пересоберите сайт.
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-12 pt-6 md:px-20 md:pb-[72px]">
        <Outlet />
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-20 md:py-8">
          <div className="flex items-center gap-6">
            <img src={logoFooter} alt="РешуМагу" className="h-8 w-auto" />
            <p className="hidden text-sm leading-[1.4] text-muted sm:block">
              Онлайн-платформа для подготовки<br />
              к вступительным экзаменам в магистратуру
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <Link to="/" className="font-semibold">Главная</Link>
            <Link to="/profile" className="font-semibold">Кабинет</Link>
            <span className="text-muted">© 2026 РешуМагу</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
