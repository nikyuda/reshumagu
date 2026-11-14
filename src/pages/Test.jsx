import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkAnswer } from "../lib/api.js";
import ReportModal from "../components/ReportModal.jsx";

function load(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}

export default function Test() {
  const { attemptId } = useParams();
  const nav = useNavigate();
  const key = `attempt:${attemptId}`;

  // Вопросы хранятся в sessionStorage, поэтому тест переживает обновление страницы
  const [data] = useState(() => load(key));
  const [answers, setAnswers] = useState(() => data?.answers ?? {});
  const [idx, setIdx] = useState(() => {
    if (!data) return 0;
    const first = data.questions.findIndex((q) => !(q.id in (data.answers ?? {})));
    return first < 0 ? 0 : first;
  });
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (data) sessionStorage.setItem(key, JSON.stringify({ ...data, answers }));
  }, [answers]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-extrabold">Тест не найден</h1>
        <p className="mt-2 text-neutral-600">
          Не удалось восстановить вопросы. Начните тест заново.
        </p>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }

  const total = data.questions.length;
  const q = data.questions[idx];
  const a = answers[q.id];
  const answeredCount = Object.keys(answers).length;
  const isLast = idx === total - 1;

  function go(i) {
    setIdx(i);
    setPicked(null);
    setError("");
  }

  async function check() {
    if (picked == null || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await checkAnswer({
        attempt_id: Number(attemptId),
        question_id: q.id,
        option_id: picked,
      });
      setAnswers((prev) => ({ ...prev, [q.id]: { selected: picked, ...r } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    if (
      answeredCount < total &&
      !window.confirm(`Вы ответили на ${answeredCount} из ${total} вопросов. Завершить тест?`)
    ) {
      return;
    }
    nav(`/result/${attemptId}`);
  }

  function optionClass(o) {
    const base = "flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ";
    if (a) {
      if (o.id === a.correct_option_id) return base + "bg-leaf";
      if (o.id === a.selected) return base + "bg-red-200";
      return base + "bg-neutral-100 text-neutral-500";
    }
    return base + (picked === o.id ? "bg-white ring-2 ring-brand" : "bg-neutral-100 hover:bg-neutral-200");
  }

  function navClass(i) {
    const r = answers[data.questions[i].id];
    let c = "grid h-9 w-9 place-items-center rounded-lg text-xs font-bold ";
    if (r) c += r.is_correct ? "bg-leaf " : "bg-red-200 ";
    else c += "bg-neutral-100 ";
    if (i === idx) c += "ring-2 ring-brand";
    return c;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
              {idx + 1}/{total}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500">Вопрос {idx + 1} из {total}</span>
          </div>

          <h1 className="mb-5 text-2xl font-extrabold leading-snug">{q.body}</h1>

          <div className="flex flex-col gap-2">
            {q.options.map((o, i) => (
              <button
                key={o.id}
                disabled={Boolean(a)}
                onClick={() => setPicked(o.id)}
                className={optionClass(o)}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold">
                  {i + 1}
                </span>
                <span>{o.body}</span>
              </button>
            ))}
          </div>

          {a && (
            <div
              className={`mt-5 rounded-2xl p-4 text-sm ${
                a.is_correct ? "bg-leaf/30" : "bg-red-100"
              }`}
            >
              <div className="mb-1 font-extrabold">
                {a.is_correct ? "Верно! Так держать!" : "Неверно"}
              </div>
              {a.explanation && <p className="text-neutral-800">{a.explanation}</p>}
              {a.image_url && (
                <img src={a.image_url} alt="" className="mt-3 max-h-64 rounded-xl" />
              )}
            </div>
          )}

          {error && <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setReporting(true)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              ⚑ Сообщить об ошибке
            </button>

            {a ? (
              <button onClick={isLast ? finish : () => go(idx + 1)} className="btn-brand">
                {isLast ? "Завершить" : "Дальше →"}
              </button>
            ) : (
              <button onClick={check} disabled={picked == null || busy} className="btn-brand">
                {busy ? "Проверка…" : "Ответить"}
              </button>
            )}
          </div>
        </div>

        <aside className="card h-fit">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">Вопросы</h2>
            <span className="text-xs text-neutral-500">{answeredCount} из {total}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.questions.map((_, i) => (
              <button key={i} onClick={() => go(i)} className={navClass(i)}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={finish} className="btn-light mt-5 w-full">Закончить тест</button>
        </aside>
      </div>

      {reporting && (
        <ReportModal
          question={q}
          position={idx + 1}
          total={total}
          onClose={() => setReporting(false)}
        />
      )}
    </>
  );
}
