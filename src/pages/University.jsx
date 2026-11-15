import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import ExamIcon from "../components/ExamIcon.jsx";
import goat from "../assets/goat.png";
import wait from "../assets/wait.png";

// Картинка на карточке «Дальше — больше!» у каждого вуза
const SURPRISE = { "АлтГУ": goat, "АлтГТУ": wait };

export default function University() {
  const { id } = useParams();
  const [uni, setUni] = useState(undefined); // undefined — загрузка, null — не найден
  const [surprise, setSurprise] = useState(false);

  useEffect(() => {
    supabase
      .from("universities")
      .select("id, short_name, name, city, exams(id, title, description)")
      .eq("id", Number(id))
      .maybeSingle()
      .then(({ data }) => setUni(data));
  }, [id]);

  if (uni === undefined) return <p className="py-10 text-muted">Загрузка…</p>;
  if (uni === null) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-extrabold">Вуз не найден</h1>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-center gap-2.5 text-[15px]">
        <Link to="/" className="text-muted hover:text-black">Главная</Link>
        <span className="text-[#929292]">/</span>
        <span className="font-semibold">{uni.short_name}</span>
      </p>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-6 rounded-[32px] bg-white px-6 pb-10 pt-10 md:rounded-[50px] md:px-14 md:pb-16 md:pt-14">
          <span className="rounded-full bg-tint px-5 py-2.5 text-[15px] font-semibold text-brand">
            г. {uni.city}
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.04] tracking-[-0.02em] md:text-[56px]">
            {uni.name}
          </h1>
          <p className="text-2xl font-bold">Выбери экзамен:</p>

          <div className="flex w-full flex-col gap-4">
            {(uni.exams ?? []).map((e) => (
              <Link
                key={e.id}
                to={`/exam/${e.id}`}
                className="flex min-h-[76px] items-center justify-between gap-3 rounded-[50px] bg-accent px-5 py-3 text-white transition hover:bg-accent/95 md:px-7"
              >
                <ExamIcon title={e.title} size={36} />
                <span className="flex flex-col items-center gap-0.5 text-center">
                  <span className="text-xl font-bold">{e.title}</span>
                  {e.description && (
                    <span className="text-[13px] text-white/85">{e.description}</span>
                  )}
                </span>
                <ExamIcon title={e.title} size={36} />
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSurprise((v) => !v)}
          className="flex flex-col items-center justify-center gap-4 self-stretch rounded-[32px] bg-leaf p-8 text-center md:rounded-[50px] md:p-10 lg:w-[470px] lg:shrink-0"
        >
          {surprise ? (
            <img
              src={SURPRISE[uni.short_name] ?? goat}
              alt=""
              className="max-h-[420px] w-full rounded-[30px] object-contain"
            />
          ) : (
            <>
              <span className="text-5xl font-extrabold leading-none tracking-[-0.02em] md:text-[52px]">
                Дальше —<br />больше!
              </span>
              <span className="text-xl leading-[1.4]">
                Нажми, если хочешь<br />свой экзамен!
              </span>
              <span className="rounded-full bg-[#141B2D] px-9 py-[18px] text-[17px] font-bold text-white">
                Хочу свой экзамен
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
