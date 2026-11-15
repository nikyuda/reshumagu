import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/auth.jsx";

const KINDS = [
  ["wrong_answer", "Ошибка в ответе"],
  ["typo", "Опечатка в вопросе"],
  ["unclear_task", "Неправильное задание"],
  ["other", "Другое"],
];

export default function ReportModal({ question, position, total, onClose }) {
  const { user } = useAuth();
  const [kind, setKind] = useState("wrong_answer");
  const [comment, setComment] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  async function send() {
    setState("sending");
    setError("");
    const { error: err } = await supabase.from("question_reports").insert({
      question_id: question.id,
      user_id: user.id,
      kind,
      comment: comment.trim() || null,
    });
    if (err) {
      setError("Не удалось отправить. Попробуйте ещё раз.");
      setState("idle");
    } else {
      setState("done");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[rgba(20,27,45,0.55)] p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[620px] flex-col gap-[22px] rounded-[32px] bg-white px-6 pb-8 pt-8 md:rounded-[44px] md:px-12 md:pb-12 md:pt-11"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[26px] font-extrabold tracking-[-0.01em] md:text-[32px]">Сообщить об ошибке</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="grid size-11 shrink-0 place-items-center rounded-[22px] bg-paper text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-base text-muted">
          Вопрос {position}/{total} · {question.body}
        </p>

        {state === "done" ? (
          <>
            <p className="rounded-3xl bg-leaf/25 p-5 text-base font-semibold">
              Спасибо! Сообщение отправлено администратору.
            </p>
            <button
              onClick={onClose}
              className="rounded-full bg-brand px-11 py-[18px] text-[17px] font-bold text-white"
            >
              Закрыть
            </button>
          </>
        ) : (
          <>
            <p className="text-[15px] font-bold">Что не так?</p>
            <div className="-mt-3 flex flex-wrap gap-2.5">
              {KINDS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setKind(value)}
                  className={`rounded-full px-5 py-3 text-[15px] font-semibold ${
                    kind === value ? "bg-brand text-white" : "bg-paper text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="text-[15px] font-bold">Комментарий</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              placeholder="Опишите, что не так — мы проверим и исправим"
              className="-mt-3 h-[130px] w-full resize-none rounded-[20px] border-[1.5px] border-line px-5 py-[18px] text-base outline-none placeholder:text-muted focus:border-brand"
            />

            {error && <p className="rounded-2xl bg-[#FFF1F1] p-3.5 text-sm font-semibold text-red-700">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-full border-[1.5px] border-line bg-white py-[18px] text-[17px] font-bold"
              >
                Отмена
              </button>
              <button
                onClick={send}
                disabled={state === "sending"}
                className="flex-1 rounded-full bg-brand py-[18px] text-[17px] font-bold text-white disabled:opacity-60"
              >
                {state === "sending" ? "Отправка…" : "Отправить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
