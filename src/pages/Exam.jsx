import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";
import { startTest } from "../lib/api.js";
import { plural } from "../lib/format.js";
import ExamIcon from "../components/ExamIcon.jsx";

const Q = ["вопрос", "вопроса", "вопросов"];

export default function Exam() {
  const { id } = useParams();
  const examId = Number(id);
  const nav = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [exam, setExam] = useState(undefined); // undefined — загрузка, null — не найден
  const [topics, setTopics] = useState([]);
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      supabase
        .from("exams")
        .select("id, title, description, questions_per_full_test, universities(id, short_name, name, city)")
        .eq("id", examId)
        .maybeSingle(),
      supabase
        .from("topic_question_counts")
        .select("topic_id, title, section, position, questions_count")
        .eq("exam_id", examId)
        .order("position"),
    ]).then(([e, t]) => {
      setExam(e.data);
      setTopics(t.data ?? []);
    });
  }, [examId]);

  async function start(mode, topicId = null, topicTitle = null) {
    if (!user) {
      nav("/auth", { state: { from: location.pathname } });
      return;
    }
    setStarting(mode === "full_exam" ? "full" : topicId);
    setError("");
    try {
      const data = await startTest({ exam_id: examId, mode, topic_id: topicId });
      sessionStorage.setItem(
        `attempt:${data.attempt_id}`,
        JSON.stringify({
          ...data,
          exam_id: examId,
          topic_id: topicId,
          topic_title: topicTitle,
          exam_title: exam.title,
          uni_id: exam.universities.id,
          uni_short: exam.universities.short_name,
          mode,
          answers: {},
        })
      );
      nav(`/test/${data.attempt_id}`);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  if (exam === undefined) return <p className="py-10 text-muted">Загрузка…</p>;
  if (exam === null) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-extrabold">Экзамен не найден</h1>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }

  const total = topics.reduce((sum, t) => sum + Number(t.questions_count), 0);
  const fullSize = Math.min(total, exam.questions_per_full_test);
  const uni = exam.universities;
  const hasEmptyTopics = topics.some((t) => Number(t.questions_count) === 0);

  const groups = [];
  for (const t of topics) {
    const name = t.section || "";
    let g = groups.find((x) => x.name === name);
    if (!g) {
      g = { name, items: [] };
      groups.push(g);
    }
    g.items.push(t);
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex flex-wrap items-center gap-2.5 text-[15px]">
        <Link to="/" className="text-muted hover:text-black">Главная</Link>
        <span className="text-[#929292]">/</span>
        <Link to={`/u/${uni.id}`} className="text-muted hover:text-black">{uni.short_name}</Link>
        <span className="text-[#929292]">/</span>
        <span className="font-semibold">{exam.title}</span>
      </p>

      {/* Шапка экзамена */}
      <div className="flex flex-col gap-6 rounded-[32px] bg-white px-6 py-8 md:rounded-[50px] lg:flex-row lg:items-center lg:justify-between lg:pl-14 lg:pr-12 lg:py-11">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3.5">
          <span className="rounded-full bg-tint px-5 py-2.5 text-[15px] font-semibold text-brand">
            г. {uni.city}
          </span>
          <h1 className="text-3xl font-extrabold leading-[1.06] tracking-[-0.015em] md:text-[40px]">
            {uni.name}
          </h1>
        </div>
        <div className="flex min-h-[76px] items-center justify-between gap-3 rounded-[50px] bg-accent px-5 py-3 text-white md:px-7 lg:w-[540px]">
          <ExamIcon title={exam.title} size={36} />
          <span className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-xl font-bold">{exam.title}</span>
            {exam.description && <span className="text-[13px] text-white/85">{exam.description}</span>}
          </span>
          <ExamIcon title={exam.title} size={36} />
        </div>
      </div>

      {/* Общий тест */}
      <button
        onClick={() => (total === 0 ? nav("/soon") : start("full_exam"))}
        disabled={starting !== null}
        className="flex flex-col gap-4 rounded-[32px] bg-leaf px-6 py-7 text-left md:flex-row md:items-center md:justify-between md:rounded-[50px] md:pl-12 md:pr-8 md:py-[30px]"
      >
        <span className="flex flex-col gap-1.5">
          <span className="text-2xl font-extrabold tracking-[-0.01em] md:text-[28px]">
            Общий тест по всем темам
          </span>
          <span className="text-[17px]">
            {fullSize} {plural(fullSize, ["случайный вопрос", "случайных вопроса", "случайных вопросов"])} из всех тем экзамена
          </span>
        </span>
        <span className="flex items-center gap-5">
          <span className="text-[17px] font-semibold">{total} {plural(total, Q)}</span>
          <span className="rounded-full bg-[#141B2D] px-9 py-[18px] text-[17px] font-bold text-white">
            {starting === "full" ? "Запуск…" : "Начать →"}
          </span>
        </span>
      </button>

      {error && <p className="rounded-2xl bg-red-100 p-4 text-sm font-semibold text-red-700">{error}</p>}

      {/* Темы */}
      <div className="flex flex-col gap-6 rounded-[32px] bg-white px-6 pb-10 pt-8 md:rounded-[50px] md:px-12 md:pb-12 md:pt-11">
        <h2 className="text-[28px] font-extrabold tracking-[-0.01em]">Темы экзамена:</h2>
        {topics.length === 0 && <p className="text-muted">Темы пока не добавлены.</p>}

        {groups.map((g) => (
          <div key={g.name} className="flex flex-col gap-3">
            {g.name && (
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted">{g.name}</h3>
            )}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((t) => {
                const count = Number(t.questions_count);
                return (
                  <button
                    key={t.topic_id}
                    onClick={() => (count === 0 ? nav("/soon") : start("topic", t.topic_id, t.title))}
                    disabled={starting !== null}
                    className="flex flex-col items-start gap-[18px] rounded-[36px] bg-paper p-7 text-left transition hover:bg-tint"
                  >
                    <span className="grid size-[52px] place-items-center rounded-[26px] bg-white text-xl font-bold">
                      {t.position}
                    </span>
                    <span className="text-xl font-bold leading-[1.3]">{t.title}</span>
                    <span className="text-base text-muted">
                      {starting === t.topic_id
                        ? "Запуск…"
                        : count === 0
                          ? "Скоро"
                          : `${count} ${plural(count, Q)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {hasEmptyTopics && (
          <div className="rounded-[36px] border-2 border-dashed border-line py-[22px] text-center text-[17px] text-muted">
            Остальные темы будут доступны позже!
          </div>
        )}
      </div>
    </div>
  );
}
