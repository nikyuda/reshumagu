import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { finishTest } from "../lib/api.js";
import { formatDuration, plural } from "../lib/format.js";

export default function Result() {
  const { attemptId } = useParams();
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  // Нужен только для ссылки «К экзамену»
  const meta = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(`attempt:${attemptId}`));
    } catch {
      return null;
    }
  }, [attemptId]);

  // finish-test можно вызывать повторно — он вернёт те же результаты
  useEffect(() => {
    let alive = true;
    finishTest({ attempt_id: Number(attemptId) })
      .then((r) => alive && setRes(r))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [attemptId]);

  if (error) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-extrabold">Не удалось получить результаты</h1>
        <p className="mt-2 text-neutral-600">{error}</p>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }
  if (!res) return <p className="py-10 text-neutral-500">Подводим итоги…</p>;

  const { attempt: at, review } = res;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card flex flex-col items-center justify-center text-center md:col-span-2">
          <p className="text-sm text-neutral-500">Тест завершён</p>
          <div className="my-2 text-7xl font-extrabold text-brand">
            {at.correct}/{at.total}
          </div>
          <p className="text-sm text-neutral-600">{at.percent}% правильных ответов</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to={meta ? `/exam/${meta.exam_id}` : "/"} className="btn-brand">К экзамену</Link>
            <Link to="/profile" className="btn-light">Кабинет</Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-leaf p-5">
            <div className="text-3xl font-extrabold">{at.correct}</div>
            <div className="text-sm">{plural(at.correct, ["верный ответ", "верных ответа", "верных ответов"])}</div>
          </div>
          <div className="rounded-3xl bg-accent p-5 text-white">
            <div className="text-3xl font-extrabold">{at.wrong + at.skipped}</div>
            <div className="text-sm">
              ошибок и пропусков
              {at.skipped > 0 && ` (пропущено: ${at.skipped})`}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <div className="text-xs font-bold uppercase text-neutral-500">Время</div>
            <div className="text-lg font-extrabold">{formatDuration(at.duration_seconds)}</div>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-2xl font-extrabold">Разбор вопросов</h2>
      <div className="flex flex-col gap-4">
        {review.map((r) => (
          <div key={r.question_id} className="card">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-neutral-100 px-2.5 py-1">№ {r.position}</span>
              {r.selected_option_id == null ? (
                <span className="rounded-full bg-neutral-200 px-2.5 py-1">Пропущен</span>
              ) : r.is_correct ? (
                <span className="rounded-full bg-leaf px-2.5 py-1">Верно</span>
              ) : (
                <span className="rounded-full bg-red-200 px-2.5 py-1">Неверно</span>
              )}
            </div>
            <h3 className="mb-3 text-lg font-extrabold">{r.body}</h3>
            <div className="flex flex-col gap-2">
              {r.options.map((o) => {
                let cls = "rounded-xl px-4 py-2.5 text-sm font-semibold ";
                if (o.id === r.correct_option_id) cls += "bg-leaf";
                else if (o.id === r.selected_option_id) cls += "bg-red-200";
                else cls += "bg-neutral-100 text-neutral-500";
                return <div key={o.id} className={cls}>{o.body}</div>;
              })}
            </div>
            {r.explanation && (
              <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">{r.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
