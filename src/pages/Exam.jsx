import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";
import { startTest } from "../lib/api.js";
import { plural } from "../lib/format.js";

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
        .select("id, title, questions_per_full_test, universities(id, short_name, name)")
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

  async function start(mode, topicId = null) {
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
        JSON.stringify({ ...data, exam_id: examId, topic_id: topicId, mode, answers: {} })
      );
      nav(`/test/${data.attempt_id}`);
    } catch (e) {
      setError(e.message);
      setStarting(null);
    }
  }

  if (exam === undefined) return <p className="py-10 text-neutral-500">Загрузка…</p>;
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

  // Группировка тем по разделам
  const groups = [];
  for (const t of topics) {
    const name = t.section || "Темы экзамена";
    let g = groups.find((x) => x.name === name);
    if (!g) {
      g = { name, items: [] };
      groups.push(g);
    }
    g.items.push(t);
  }

  return (
    <>
      <p className="mb-3 text-sm text-neutral-500">
        <Link to="/" className="hover:underline">Главная</Link> /{" "}
        <Link to={`/u/${uni.id}`} className="hover:underline">{uni.short_name}</Link> / {exam.title}
      </p>

      <div className="card">
        <h1 className="text-3xl font-extrabold md:text-4xl">{uni.name}</h1>
        <p className="mt-2 text-lg font-bold text-accent">{exam.title}</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-leaf p-5">
          <div>
            <div className="text-lg font-extrabold">Общий тест по всем темам</div>
            <div className="text-sm">
              {fullSize} случайных {plural(fullSize, ["вопрос", "вопроса", "вопросов"])} из {total}
            </div>
          </div>
          <button
            onClick={() => start("full_exam")}
            disabled={total === 0 || starting !== null}
            className="btn-dark"
          >
            {starting === "full" ? "Запуск…" : "Начать →"}
          </button>
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>

      <div className="card mt-4">
        <h2 className="mb-4 text-xl font-extrabold">Темы экзамена</h2>
        {topics.length === 0 && <p className="text-neutral-500">Темы пока не добавлены.</p>}

        {groups.map((g) => (
          <div key={g.name} className="mb-6 last:mb-0">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">{g.name}</h3>
            <div className="flex flex-col gap-2">
              {g.items.map((t) => (
                <div
                  key={t.topic_id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-100 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold">
                      {t.position}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{t.title}</div>
                      <div className="text-xs text-neutral-500">
                        {t.questions_count} {plural(Number(t.questions_count), ["вопрос", "вопроса", "вопросов"])}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => start("topic", t.topic_id)}
                    disabled={Number(t.questions_count) === 0 || starting !== null}
                    className="btn-brand shrink-0"
                  >
                    {starting === t.topic_id ? "Запуск…" : "Начать"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
