// POST /api/check-answer
// Тело: { attempt_id, question_id, option_id }
// Мгновенная проверка: верно/неверно, правильный вариант и пояснение.
// Один вопрос — один ответ (повторно ответить нельзя).
import { db, json, fail, route, loadOwnAttempt } from "../lib/common.js";

export default route("POST", async ({ user, body }) => {
  const attemptId = Number(body.attempt_id);
  const questionId = Number(body.question_id);
  const optionId = Number(body.option_id);
  if (![attemptId, questionId, optionId].every(Number.isInteger))
    return fail(400, "Нужны attempt_id, question_id и option_id");

  const attempt = await loadOwnAttempt(attemptId, user.id);
  if (!attempt) return fail(404, "Попытка не найдена");
  if (attempt.finished_at) return fail(409, "Тест уже завершён");

  const { data: row } = await db
    .from("attempt_answers").select("selected_option_id")
    .eq("attempt_id", attemptId).eq("question_id", questionId).maybeSingle();
  if (!row) return fail(404, "Этого вопроса нет в вашей попытке");
  if (row.selected_option_id !== null) return fail(409, "Ответ на этот вопрос уже дан");

  const { data: options } = await db
    .from("answer_options").select("id, is_correct").eq("question_id", questionId);
  const chosen = options?.find((o) => o.id === optionId);
  if (!chosen) return fail(400, "Такого варианта нет у этого вопроса");
  const correct = options.find((o) => o.is_correct);

  // Запись только если ответа ещё нет — защита от двойного клика / гонки
  const { data: updated } = await db
    .from("attempt_answers")
    .update({
      selected_option_id: optionId,
      is_correct: chosen.is_correct,
      answered_at: new Date().toISOString(),
    })
    .eq("attempt_id", attemptId).eq("question_id", questionId)
    .is("selected_option_id", null)
    .select("question_id");
  if (!updated?.length) return fail(409, "Ответ на этот вопрос уже дан");

  const { data: q } = await db
    .from("questions").select("explanation, image_url").eq("id", questionId).single();

  return json({
    is_correct: chosen.is_correct,
    correct_option_id: correct?.id ?? null,
    explanation: q.explanation,
    image_url: q.image_url,
  });
});
