import { db, json, fail, route, loadOwnAttempt } from "../lib/common.js";

export default route("POST", async ({ user, body }) => {
  const attemptId = Number(body.attempt_id);
  if (!Number.isInteger(attemptId)) return fail(400, "Нужен attempt_id");

  const attempt = await loadOwnAttempt(
    attemptId, user.id,
    "id, user_id, mode, total_questions, started_at, finished_at, duration_seconds"
  );
  if (!attempt) return fail(404, "Попытка не найдена");

  const { data: rows } = await db
    .from("attempt_answers")
    .select("question_id, position, selected_option_id, is_correct")
    .eq("attempt_id", attemptId).order("position");

  const correct = rows.filter((r) => r.is_correct).length;
  const answered = rows.filter((r) => r.selected_option_id !== null).length;

  let duration = attempt.duration_seconds;
  if (!attempt.finished_at) {
    duration = Math.max(0, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000));
    await db.from("test_attempts")
      .update({
        finished_at: new Date().toISOString(),
        correct_count: correct,
        duration_seconds: duration,
      })
      .eq("id", attemptId).is("finished_at", null);
  }

  const qIds = rows.map((r) => r.question_id);
  const [{ data: questions }, { data: options }] = await Promise.all([
    db.from("questions").select("id, body, explanation, image_url").in("id", qIds),
    db.from("answer_options").select("id, question_id, body, is_correct, position").in("question_id", qIds).order("position"),
  ]);
  const qById = new Map(questions.map((q) => [q.id, q]));

  const review = rows.map((r) => {
    const q = qById.get(r.question_id);
    const opts = options.filter((o) => o.question_id === r.question_id);
    return {
      position: r.position,
      question_id: r.question_id,
      body: q.body,
      explanation: q.explanation,
      image_url: q.image_url,
      selected_option_id: r.selected_option_id,
      correct_option_id: opts.find((o) => o.is_correct)?.id ?? null,
      is_correct: r.is_correct,
      options: opts.map((o) => ({ id: o.id, body: o.body })),
    };
  });

  const total = attempt.total_questions;
  return json({
    attempt: {
      id: attemptId,
      mode: attempt.mode,
      total,
      correct,
      wrong: answered - correct,
      skipped: total - answered,
      percent: Math.round((100 * correct) / total),
      duration_seconds: duration,
    },
    review,
  });
});
