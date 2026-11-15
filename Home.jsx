import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import ExamIcon from "../components/ExamIcon.jsx";
import altgu from "../assets/altgu.png";
import altgtu from "../assets/altgtu.png";

const UNI_LOGOS = { "АлтГУ": altgu, "АлтГТУ": altgtu };

export default function Home() {
  const nav = useNavigate();
  const [unis, setUnis] = useState(null);
  const [error, setError] = useState("");
  const [dir, setDir] = useState(null); // выбранное направление

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

  // Направления = уникальные названия экзаменов по всем вузам
  const directions = useMemo(() => {
    const map = new Map();
    for (const u of unis ?? []) {
      for (const e of u.exams ?? []) {
        if (!map.has(e.title)) map.set(e.title, []);
        map.get(e.title).push(u.short_name);
      }
    }
    return [...map].map(([title, names]) => ({ title, names }));
  }, [unis]);

  function pickUni(u) {
    const exam = dir ? (u.exams ?? []).find((e) => e.title === dir) : null;
    nav(exam ? `/exam/${exam.id}` : `/u/${u.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Первый экран */}
      <section className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col items-start gap-7 rounded-[32px] bg-white px-6 py-10 md:rounded-[50px] md:py-16 lg:pl-[72px] lg:pr-16">
          <span className="rounded-full bg-tint px-5 py-2.5 text-[15px] font-semibold text-brand">
            Подготовка в магистратуру · АлтГУ и АлтГТУ
          </span>
          <h1 className="text-5xl font-extrabold leading-[1.04] tracking-[-0.02em] md:text-[76px]">
            Готовься
            <br />
            <span className="text-brand">к поступлению</span>
            <br />
            с умом!
          </h1>
          <p className="text-lg leading-[1.45] text-muted md:text-xl">
            Онлайн-платформа для тестовой подготовки
            <br className="hidden md:block" /> к вступительным экзаменам в магистратуру
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#vuz" className="rounded-full bg-brand px-10 py-5 text-lg font-bold text-white transition hover:bg-brand/90">
              Выбрать вуз
            </a>
            <Link to="/profile" className="rounded-full border-2 border-line px-[38px] py-[18px] text-lg font-bold">
              Личный кабинет
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {[
            ["100%", "бесплатный", "доступ"],
            ["0 сек", "мгновенная", "проверка"],
          ].map(([big, l1, l2]) => (
            <div
              key={big}
              className="flex flex-col justify-center gap-2 rounded-[32px] bg-brand px-8 py-10 text-white md:rounded-[50px] md:px-11"
            >
              <p className="text-6xl font-bold tracking-[-0.02em] md:text-[72px]">{big}</p>
              <p className="text-xl leading-[1.3]">
                {l1}
                <br />
                {l2}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Выбор направления и вуза */}
      <section id="vuz" className="grid scroll-mt-6 gap-6 lg:grid-cols-[1fr_500px]">
        <div className="flex flex-col gap-6 rounded-[32px] bg-white p-6 md:rounded-[50px] md:p-10">
          <span className="w-fit rounded-full bg-leaf px-7 py-3 text-[17px] font-bold">
            В данный момент доступны:
          </span>

          {error && <p className="rounded-2xl bg-red-100 p-4 font-semibold text-red-700">{error}</p>}
          {!unis && !error && <p className="text-muted">Загрузка…</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            {directions.map((d) => {
              const selected = dir === d.title;
              return (
                <button
                  key={d.title}
                  onClick={() => setDir(selected ? null : d.title)}
                  className={`relative flex flex-col items-start gap-3.5 rounded-[40px] bg-accent px-6 pb-8 pt-7 text-left text-white transition hover:bg-accent/95 ${
                    selected ? "outline outline-[3px] outline-black" : ""
                  }`}
                >
                  {selected && (
                    <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-accent">
                      Для начала выбери ВУЗ →
                    </span>
                  )}
                  <ExamIcon title={d.title} />
                  <span className="text-2xl font-bold">{d.title}</span>
                  <span className="text-[15px] text-white/85">Экзамен в {d.names.join(" и ")}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[32px] bg-white p-6 md:rounded-[50px] md:p-10">
          <span className="w-fit rounded-full bg-leaf px-7 py-3 text-[17px] font-bold">Выбери ВУЗ:</span>

          <div className="grid gap-4 sm:grid-cols-2">
            {(unis ?? []).map((u) => {
              const offers = dir && (u.exams ?? []).some((e) => e.title === dir);
              const style = dir
                ? offers
                  ? "outline-dashed outline-2 outline-brand"
                  : "opacity-50"
                : "";
              return (
                <button
                  key={u.id}
                  onClick={() => pickUni(u)}
                  className={`flex flex-col items-center gap-2.5 rounded-[40px] bg-paper px-4 pb-7 pt-6 text-center transition hover:bg-tint ${style}`}
                >
                  <div className="grid h-24 w-[120px] place-items-center">
                    {UNI_LOGOS[u.short_name] ? (
                      <img src={UNI_LOGOS[u.short_name]} alt={u.short_name} className="max-h-24 max-w-[96px] object-contain" />
                    ) : (
                      <div className="grid size-20 place-items-center rounded-full bg-white text-2xl font-extrabold text-brand">
                        {u.short_name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <span className="text-[22px] font-bold">{u.short_name}</span>
                  <span className="text-sm leading-[1.35] text-muted">{u.name}</span>
                  {dir && !offers && (
                    <span className="text-xs font-semibold text-accent">Этого экзамена здесь пока нет</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
