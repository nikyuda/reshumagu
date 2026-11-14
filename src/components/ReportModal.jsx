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
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold">Сообщить об ошибке</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700" aria-label="Закрыть">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-neutral-500">
          Вопрос {position} из {total}: {question.body}
        </p>

        {state === "done" ? (
          <>
            <p className="rounded-2xl bg-leaf/30 p-4 text-sm font-semibold">
              Спасибо! Сообщение отправлено администратору.
            </p>
            <button onClick={onClose} className="btn-brand mt-4 w-full">Закрыть</button>
          </>
        ) : (
          <>
            <p className="mb-2 text-xs font-bold uppercase text-neutral-500">Что не так?</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {KINDS.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setKind(value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    kind === value ? "bg-brand text-white" : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs font-bold uppercase text-neutral-500">Комментарий</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Опишите, что не так — мы проверим и исправим"
              className="input mb-4 resize-none"
            />
            {error && <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-light flex-1">Отмена</button>
              <button onClick={send} disabled={state === "sending"} className="btn-brand flex-1">
                {state === "sending" ? "Отправка…" : "Отправить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
