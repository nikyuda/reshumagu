import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";

const ERRORS = {
  "Invalid login credentials": "Неверный email или пароль",
  "User already registered": "Пользователь с таким email уже зарегистрирован",
  "Email not confirmed": "Email не подтверждён. Проверьте почту",
};

const FACTS = [
  ["100%", "бесплатный доступ"],
  ["0 сек", "мгновенная проверка"],
  ["2 вуза", "АлтГУ и АлтГТУ"],
];

export default function Auth() {
  const { user } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
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

    if (mode === "register" && (name.trim().length < 2 || name.trim().length > 40))
      return setError("Введите никнейм или имя (от 2 до 40 символов)");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Введите корректный email");
    if (password.length < 8) return setError("Пароль должен быть не короче 8 символов");

    setBusy(true);
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(ERRORS[err.message] || err.message);
      else nav(from, { replace: true });
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      });
      if (err) setError(ERRORS[err.message] || err.message);
      else if (data.session) nav(from, { replace: true });
      else setInfo("Мы отправили письмо для подтверждения. Перейдите по ссылке в письме и войдите.");
    }
    setBusy(false);
  }

  const isLogin = mode === "login";

  return (
    <div className="flex flex-col gap-6 lg:min-h-[720px] lg:flex-row">
      {/* Промо */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-10 rounded-[32px] bg-brand p-8 md:rounded-[50px] md:p-16">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold leading-[1.04] tracking-[-0.02em] text-white md:text-[64px]">
            Готовься
            <br />
            <span className="text-leaf">к поступлению</span>
            <br />
            с умом!
          </h1>
          <p className="text-xl leading-[1.45] text-white/85">
            Решайте тесты в формате вступительных
            <br className="hidden md:block" /> экзаменов и сразу видите свои ошибки
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {FACTS.map(([big, label]) => (
            <div key={big} className="flex flex-col gap-1 rounded-[32px] bg-white/[0.12] px-[26px] py-[22px]">
              <p className="text-[32px] font-bold text-white">{big}</p>
              <p className="text-[15px] text-white/85">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Форма */}
      <form
        onSubmit={submit}
        className="flex w-full flex-col justify-center gap-[22px] rounded-[32px] bg-white p-8 md:rounded-[50px] md:p-14 lg:w-[560px] lg:shrink-0"
      >
        <h2 className="text-[36px] font-extrabold tracking-[-0.01em]">
          {isLogin ? "С возвращением!" : "Создайте аккаунт"}
        </h2>
        <p className="-mt-3 text-[17px] text-muted">
          {isLogin ? "Войдите, чтобы продолжить подготовку" : "Это бесплатно и займёт меньше минуты"}
        </p>

        <div className="flex rounded-full bg-tint p-1.5">
          {[
            ["login", "Вход"],
            ["register", "Регистрация"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => {
                setMode(value);
                setError("");
                setInfo("");
              }}
              className={`flex-1 rounded-full py-3.5 text-[17px] ${
                mode === value ? "bg-brand font-bold text-white" : "font-semibold text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!isLogin && (
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-bold">Никнейм (имя)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Никита / НикитаРешуМагу24"
              maxLength={40}
              autoComplete="nickname"
              className="input"
            />
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-bold">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mail.ru"
            autoComplete="email"
            className="input"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-bold">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Не короче 8 символов"
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="input"
          />
        </label>

        {error && <p className="rounded-2xl bg-[#FFF1F1] p-3.5 text-sm font-semibold text-red-700">{error}</p>}
        {info && <p className="rounded-2xl bg-leaf/25 p-3.5 text-sm font-semibold">{info}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-brand py-5 text-lg font-bold text-white transition hover:bg-brand/90 disabled:opacity-60"
        >
          {busy ? "Подождите…" : isLogin ? "Войти" : "Зарегистрироваться"}
        </button>

        <p className="text-sm text-muted">Регистрация бесплатна. Пароль хранится в зашифрованном виде.</p>
      </form>
    </div>
  );
}
