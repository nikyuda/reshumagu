import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function Home() {
  const [unis, setUnis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("universities")
      .select("id, short_name, name, exams(id, title)")
      .eq("is_active", true)
      .order("id")
      .then(({ data, error: err }) => {
        if (err) setError("Не удалось загрузить список вузов");
        else setUnis(data);
      });
  }, []);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
            Подготовка к магистратуре · АлтГУ и АлтГТУ
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
            Готовься <span className="text-brand">к поступлению</span> с умом!
          </h1>
          <p className="mt-4 max-w-md text-neutral-600">
            Онлайн-платформа для тестовой подготовки к вступительным экзаменам в магистратуру.
            Решайте тесты в формате экзамена и сразу видьте свои ошибки.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#vuz" className="btn-brand">Выбрать вуз</a>
            <Link to="/profile" className="btn-light">Личный кабинет</Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-brand p-6 text-white">
            <div className="text-4xl font-extrabold">100%</div>
            <div className="mt-1 text-sm opacity-80">бесплатный доступ</div>
          </div>
          <div className="rounded-3xl bg-brand p-6 text-white">
            <div className="text-4xl font-extrabold">0 сек</div>
            <div className="mt-1 text-sm opacity-80">мгновенная проверка</div>
          </div>
        </div>
      </section>

      <section id="vuz" className="mt-10 scroll-mt-6">
        <h2 className="mb-4 text-2xl font-extrabold">Выберите вуз</h2>

        {error && <p className="rounded-2xl bg-red-100 p-4 font-semibold text-red-700">{error}</p>}
        {!unis && !error && <p className="text-neutral-500">Загрузка…</p>}

        <div className="grid gap-4 md:grid-cols-2">
          {(unis ?? []).map((u) => (
            <div key={u.id} className="card">
              <Link to={`/u/${u.id}`} className="block">
                <div className="text-3xl font-extrabold text-brand">{u.short_name}</div>
                <div className="mt-1 text-sm text-neutral-600">{u.name}</div>
              </Link>
              <div className="mt-5 flex flex-col gap-2">
                {(u.exams ?? []).map((e) => (
                  <Link
                    key={e.id}
                    to={`/exam/${e.id}`}
                    className="rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                  >
                    {e.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
