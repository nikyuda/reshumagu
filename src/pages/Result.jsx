import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { finishTest } from "../lib/api.js";
import { plural } from "../lib/format.js";
import ExamIcon from "../components/ExamIcon.jsx";

export default function Result() {
  const { attemptId } = useParams();
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  // Данные попытки нужны только для названия экзамена и ссылки «Решать дальше»
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
        <p className="mt-2 text-muted">{error}</p>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }
  if (!res) return <p className="py-10 text-muted">Подводим итоги…</p>;

  const { attempt: at, review } = res;
  const testName =
    at.mode === "topic" ? meta?.topic_title || "Тест по теме" : "Общий тест по всем темам";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Итог */}
        <div className="flex min-w-0 flex-1 flex-col items-center gap-5 rounded-[32px] bg-white px-6 pb-10 pt-10 md:rounded-[50px] md:px-16 md:pb-14 md:pt-12">
          <p className="text-lg font-semibold text-muted">Тест завершён</p>
          <p className="text-center text-[96px] font-bold leading-none tracking-[-0.04em] text-brand md:text-[200px]">
            {at.correct}/{at.total}
          </p>
          <p className="text-[22px] font-semibold text-brand">{at.percent}% правильных ответов</p>

          <div className="flex w-full max-w-[560px] flex-col gap-3">
            {meta?.exam_title && (
              <div className="flex h-[76px] items-center justify-between rounded-[50px] bg-accent px-7 text-white">
                <ExamIcon title={meta.exam_title} size={36} />
                <span className="text-xl font-bold">{meta.exam_title}</span>
                <ExamIcon title={meta.exam_title} size={36} />
              </div>
            )}
            <div className="rounded-full bg-leaf px-6 py-4 text-center text-[17px] font-bold">{testName}</div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={meta ? `/exam/${meta.exam_id}` : "/"}
              className="rounded-full bg-brand px-12 py-5 text-[17px] font-bold text-white transition hover:bg-brand/90"
            >
              Решать дальше
            </Link>
            <Link
              to="/profile"
              className="rounded-full bg-brand px-12 py-5 text-[17px] font-bold text-white transition hover:bg-brand/90"
            >
              Кабинет
            </Link>
          </div>
        </div>

        {/* Разбор */}
        <div className="flex w-full flex-col gap-4 lg:w-[400px] lg:shrink-0">
          <div className="flex flex-1 flex-col justify-center gap-1 rounded-[40px] bg-leaf px-8 py-7">
            <p className="text-[64px] font-bold leading-[1.1] tracking-[-0.02em]">{at.correct}</p>
            <p className="text-lg">
              {plural(at.correct, ["верный ответ", "верных ответа", "верных ответов"])}
            </p>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-1 rounded-[40px] bg-accent px-8 py-7 text-white">
            <p className="text-[64px] font-bold leading-[1.1] tracking-[-0.02em]">{at.wrong + at.skipped}</p>
            <p className="text-lg">ошибок и пропусков</p>
          </div>
          <div className="flex flex-col gap-2 rounded-[40px] bg-white px-8 py-7">
            <p className="text-lg font-extrabold">Совет</p>
            <p className="text-base leading-[1.45] text-muted">
              Пройдите тест ещё раз — вопросы каждый раз новые, а пояснения помогут закрепить тему.
            </p>
          </div>
        </div>
      </div>

      {/* Список вопросов с разбором */}
      <h2 className="mt-4 text-[28px] font-extrabold tracking-[-0.01em]">Разбор вопросов</h2>
      <div className="flex flex-col gap-4">
        {review.map((r) => (
          <div key={r.question_id} className="rounded-[32px] bg-white p-6 md:rounded-[40px] md:p-8">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <span className="rounded-full bg-paper px-3 py-1">№ {r.position}</span>
              {r.selected_option_id == null ? (
                <span className="rounded-full bg-paper px-3 py-1 text-muted">Пропущен</span>
              ) : r.is_correct ? (
                <span className="rounded-full bg-leaf px-3 py-1">Верно</span>
              ) : (
                <span className="rounded-full bg-[#FFA0A0] px-3 py-1 text-white">Неверно</span>
              )}
            </div>
            <h3 className="mb-4 text-xl font-extrabold md:text-2xl">{r.body}</h3>
            <div className="flex flex-col gap-2.5">
              {r.options.map((o) => {
                let cls = "rounded-3xl px-5 py-3.5 text-[17px] font-medium ";
                if (o.id === r.correct_option_id) cls += "bg-leaf";
                else if (o.id === r.selected_option_id) cls += "bg-[#FFA0A0]";
                else cls += "bg-paper text-muted";
                return <div key={o.id} className={cls}>{o.body}</div>;
              })}
            </div>
            {r.explanation && (
              <p className="mt-4 rounded-3xl bg-paper px-5 py-4 text-base leading-[1.45] text-muted">
                {r.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
