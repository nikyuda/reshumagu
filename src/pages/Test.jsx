import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkAnswer } from "../lib/api.js";
import ReportModal from "../components/ReportModal.jsx";
import ExamIcon from "../components/ExamIcon.jsx";

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
        <p className="mt-2 text-muted">Не удалось восстановить вопросы. Начните тест заново.</p>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }

  const total = data.questions.length;
  const q = data.questions[idx];
  const a = answers[q.id];
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((x) => x.is_correct).length;
  const isLast = idx === total - 1;
  const testName = data.mode === "topic" ? data.topic_title || "Тест по теме" : "Общий тест";

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
    let bg;
    if (a) {
      if (o.id === a.correct_option_id) bg = "bg-leaf";
      else if (o.id === a.selected) bg = "bg-[#FFA0A0]";
      else bg = "bg-paper";
    } else {
      bg = picked === o.id ? "bg-white outline outline-2 -outline-offset-2 outline-brand" : "bg-paper hover:bg-tint";
    }
    return `flex w-full items-center gap-4 rounded-3xl py-3.5 pl-3.5 pr-6 text-left transition ${bg}`;
  }

  function cellClass(i) {
    const r = answers[data.questions[i].id];
    let c = "grid h-11 w-[51px] place-items-center rounded-[14px] text-[15px] font-semibold ";
    if (r) c += r.is_correct ? "bg-leaf text-black " : "bg-[#FFA0A0] text-white ";
    else c += "bg-paper text-muted ";
    if (i === idx) c += "outline outline-2 outline-offset-2 outline-brand";
    return c;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="flex flex-wrap items-center gap-2.5 text-[15px]">
        <Link to="/" className="text-muted hover:text-black">Главная</Link>
        {data.uni_id && (
          <>
            <span className="text-[#929292]">/</span>
            <Link to={`/u/${data.uni_id}`} className="text-muted hover:text-black">{data.uni_short}</Link>
          </>
        )}
        {data.exam_id && data.exam_title && (
          <>
            <span className="text-[#929292]">/</span>
            <Link to={`/exam/${data.exam_id}`} className="text-muted hover:text-black">{data.exam_title}</Link>
          </>
        )}
        <span className="text-[#929292]">/</span>
        <span className="font-semibold">{testName}</span>
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Вопрос */}
        <div className="flex min-w-0 flex-1 flex-col gap-7 rounded-[32px] bg-white px-6 pb-10 pt-8 md:rounded-[50px] md:px-14 md:pb-14 md:pt-12">
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-brand px-5 py-2.5 text-lg font-bold text-white">
              {idx + 1}/{total}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-md bg-paper">
              <div
                className="h-3 rounded-md bg-brand transition-all"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
            <span className="hidden whitespace-nowrap text-[15px] text-muted sm:block">
              Вопрос {idx + 1} из {total}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-[-0.015em] md:text-[40px]">{q.body}</h1>

          <div className="flex flex-col gap-3">
            {q.options.map((o, i) => (
              <button key={o.id} disabled={Boolean(a)} onClick={() => setPicked(o.id)} className={optionClass(o)}>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-[20px] text-base font-bold ${
                    a && (o.id === a.correct_option_id || o.id === a.selected) ? "bg-white/60" : "bg-white"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[17px] font-medium">{o.body}</span>
              </button>
            ))}
          </div>

          {a && (
            <div
              className={`flex flex-col items-start gap-4 rounded-[36px] px-8 py-7 ${
                a.is_correct ? "bg-leaf/20" : "bg-[#FFF1F1]"
              }`}
            >
              <span
                className={`rounded-full px-[22px] py-2.5 text-[17px] font-bold ${
                  a.is_correct ? "bg-leaf text-black" : "bg-[#FFA0A0] text-white"
                }`}
              >
                {a.is_correct ? "Верно!" : "Неверно!"}
              </span>
              <p className="text-xl font-bold leading-[1.35]">
                {a.explanation || (a.is_correct ? "Так держать!" : "")}
              </p>
              {a.image_url && <img src={a.image_url} alt="" className="max-h-64 rounded-2xl" />}
            </div>
          )}

          {error && <p className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setReporting(true)} className="whitespace-pre text-left text-[15px] text-muted hover:text-black">
              {"⚑  Сообщить об ошибке"}
            </button>

            {a ? (
              <button
                onClick={isLast ? finish : () => go(idx + 1)}
                className="rounded-full bg-brand px-11 py-[18px] text-[17px] font-bold text-white transition hover:bg-brand/90"
              >
                {isLast ? "Завершить" : "Дальше →"}
              </button>
            ) : (
              <button
                onClick={check}
                disabled={picked == null || busy}
                className="rounded-full bg-brand px-11 py-[18px] text-[17px] font-bold text-white transition hover:bg-brand/90 disabled:bg-[#C9B9FF]"
              >
                {busy ? "Проверка…" : "Ответить"}
              </button>
            )}
          </div>
        </div>

        {/* Боковая панель */}
        <aside className="flex w-full flex-col gap-6 lg:w-[420px] lg:shrink-0">
          <div className="flex flex-col gap-3 rounded-[32px] bg-white p-6 md:rounded-[50px]">
            {data.exam_title && (
              <Link
                to={`/exam/${data.exam_id}`}
                className="flex h-[76px] items-center justify-between rounded-[50px] bg-accent px-7 text-white"
              >
                <ExamIcon title={data.exam_title} size={36} />
                <span className="text-xl font-bold">{data.exam_title}</span>
                <ExamIcon title={data.exam_title} size={36} />
              </Link>
            )}
            <div className="rounded-full bg-leaf px-6 py-4 text-center text-[17px] font-bold">
              {data.mode === "topic" ? data.topic_title || "Тест по теме" : "Общий тест по всем темам"}
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-[32px] bg-white p-6 md:rounded-[50px] md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold">Вопросы</h2>
              <span className="text-[15px] text-muted">{correctCount} верно</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {data.questions.map((_, i) => (
                <button key={i} onClick={() => go(i)} className={cellClass(i)}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              className="rounded-full border-[1.5px] border-line bg-white py-4 text-[17px] font-bold transition hover:bg-paper"
            >
              Закончить тест
            </button>
          </div>
        </aside>
      </div>

      {reporting && (
        <ReportModal question={q} position={idx + 1} total={total} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
