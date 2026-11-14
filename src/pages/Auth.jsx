import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";

const ERRORS = {
  "Invalid login credentials": "Неверный email или пароль",
  "User already registered": "Пользователь с таким email уже зарегистрирован",
  "Email not confirmed": "Email не подтверждён. Проверьте почту",
};

export default function Auth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Введите корректный email");
    if (password.length < 6) return setError("Пароль должен быть не короче 6 символов");

    setBusy(true);
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(ERRORS[err.message] || err.message);
      else nav(from, { replace: true });
    } else {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      if (err) setError(ERRORS[err.message] || err.message);
      else if (data.session) nav(from, { replace: true });
      else setInfo("Мы отправили письмо для подтверждения. Перейдите по ссылке в письме и войдите.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
      <div className="rounded-3xl bg-brand p-8 text-white">
        <h1 className="text-3xl font-extrabold leading-tight">
          Готовься <span className="text-leaf">к поступлению</span> с умом!
        </h1>
        <p className="mt-3 text-sm opacity-80">
          Решайте тесты в формате вступительных экзаменов и сразу видьте свои результаты.
        </p>
      </div>

      <form onSubmit={submit} className="card">
        <h2 className="text-2xl font-extrabold">{mode === "login" ? "С возвращением!" : "Создайте аккаунт"}</h2>

        <div className="my-4 grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-sm font-bold">
          {[["login", "Вход"], ["register", "Регистрация"]].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => { setMode(value); setError(""); setInfo(""); }}
              className={`rounded-full py-2 ${mode === value ? "bg-brand text-white" : "text-neutral-600"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold text-neutral-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@mail.ru"
          autoComplete="email"
          className="input mb-3"
        />

        <label className="mb-1 block text-xs font-bold text-neutral-500">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Не короче 6 символов"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input mb-4"
        />

        {error && <p className="mb-3 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
        {info && <p className="mb-3 rounded-xl bg-leaf/30 p-3 text-sm font-semibold">{info}</p>}

        <button type="submit" disabled={busy} className="btn-brand w-full">
          {busy ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
}
