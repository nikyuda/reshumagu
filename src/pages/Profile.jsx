import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";
import { MODE_LABEL, formatDuration } from "../lib/format.js";

export default function Profile() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [a, s] = await Promise.all([
        supabase
          .from("test_attempts")
          .select(
            "id, mode, total_questions, correct_count, duration_seconds, finished_at, exams(title, universities(short_name))"
          )
          .eq("user_id", user.id)
          .not("finished_at", "is", null)
          .order("finished_at", { ascending: false })
          .limit(20),
        supabase
          .from("user_topic_stats")
          .select("topic_id, answered, correct, percent")
          .eq("user_id", user.id),
      ]);

      const rows = s.data ?? [];
      const titles = {};
      if (rows.length) {
        const t = await supabase
          .from("topics")
          .select("id, title")
          .in("id", rows.map((x) => x.topic_id));
        (t.data ?? []).forEach((x) => (titles[x.id] = x.title));
      }
      if (!alive) return;
      setAttempts(a.data ?? []);
      setStats(
        rows
          .map((x) => ({ ...x, percent: Number(x.percent), title: titles[x.topic_id] ?? "Тема" }))
          .sort((x, y) => x.percent - y.percent)
      );
    })();
    return () => {
      alive = false;
    };
  }, [user.id]);

  if (!attempts) return <p className="py-10 text-neutral-500">Загрузка…</p>;

  const totalQ = attempts.reduce((s, x) => s + x.total_questions, 0);
  const totalOk = attempts.reduce((s, x) => s + x.correct_count, 0);
  const overall = totalQ ? Math.round((100 * totalOk) / totalQ) : 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl font-extrabold text-brand">
            {user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate font-extrabold">{user.email.split("@")[0]}</div>
            <div className="truncate text-xs text-neutral-500">{user.email}</div>
          </div>
        </div>
        <div className="rounded-3xl bg-brand p-6 text-white">
          <div className="text-4xl font-extrabold">{attempts.length}</div>
          <div className="text-sm opacity-80">тестов пройдено (последние 20)</div>
        </div>
        <div className="rounded-3xl bg-leaf p-6">
          <div className="text-4xl font-extrabold">{overall}%</div>
          <div className="text-sm">правильных ответов</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-xl font-extrabold">Успеваемость по темам</h2>
          {stats.length === 0 && (
            <p className="text-sm text-neutral-500">
              Пока нет данных. Пройдите тест — здесь появится статистика, слабые темы будут сверху.
            </p>
          )}
          <div className="flex flex-col gap-3">
            {stats.map((s) => (
              <div key={s.topic_id}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="font-semibold">{s.title}</span>
                  <span className="font-bold">{s.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full bg-brand" style={{ width: `${s.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-extrabold">История попыток</h2>
          {attempts.length === 0 && (
            <div className="text-sm text-neutral-500">
              Вы ещё не проходили тесты.{" "}
              <Link to="/" className="font-bold text-brand">Выбрать вуз</Link>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {attempts.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-100 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {x.exams?.universities?.short_name} · {x.exams?.title}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {MODE_LABEL[x.mode]} · {new Date(x.finished_at).toLocaleString("ru-RU")} ·{" "}
                    {formatDuration(x.duration_seconds)}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-extrabold">
                  {x.correct_count}/{x.total_questions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
