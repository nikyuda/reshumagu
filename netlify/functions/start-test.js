import { db, json, fail, route, shuffle } from "../lib/common.js";

const MAX_TOPIC_QUESTIONS = 30; // потолок для теста по одной теме

export default route("POST", async ({ user, body }) => {
  const examId = Number(body.exam_id);
  const mode = body.mode;
  const topicId = body.topic_id == null ? null : Number(body.topic_id);

  if (!Number.isInteger(examId) || !["topic", "full_exam"].includes(mode))
    return fail(400, "Нужны exam_id и mode (topic или full_exam)");
  if (mode === "topic" && !Number.isInteger(topicId))
    return fail(400, "Для теста по теме нужен topic_id");

  const { data: exam } = await db
    .from("exams").select("id, is_active, questions_per_full_test").eq("id", examId).maybeSingle();
  if (!exam || !exam.is_active) return fail(404, "Экзамен не найден");

  let topicIds;
  if (mode === "topic") {
    const { data: topic } = await db
      .from("topics").select("id").eq("id", topicId).eq("exam_id", examId).maybeSingle();
    if (!topic) return fail(404, "Тема не найдена в этом экзамене");
    topicIds = [topicId];
  } else {
    const { data: topics } = await db.from("topics").select("id").eq("exam_id", examId);
    topicIds = (topics ?? []).map((t) => t.id);
  }
  if (!topicIds.length) return fail(409, "В экзамене пока нет тем");

  const { data: pool } = await db
    .from("questions").select("id").in("topic_id", topicIds).eq("is_active", true);
  if (!pool?.length) return fail(409, "В этом тесте пока нет вопросов");

  const limit = mode === "full_exam" ? exam.questions_per_full_test : MAX_TOPIC_QUESTIONS;
  const picked = shuffle(pool.map((q) => q.id)).slice(0, limit);

  const { data: attempt, error: attemptErr } = await db
    .from("test_attempts")
    .insert({
      user_id: user.id,
      exam_id: examId,
      topic_id: mode === "topic" ? topicId : null,
      mode,
      total_questions: picked.length,
    })
    .select("id, started_at")
    .single();
  if (attemptErr) throw attemptErr;

  const { error: rowsErr } = await db.from("attempt_answers").insert(
    picked.map((qid, i) => ({ attempt_id: attempt.id, question_id: qid, position: i + 1 }))
  );
  if (rowsErr) {
    await db.from("test_attempts").delete().eq("id", attempt.id);
    throw rowsErr;
  }

  const [{ data: questions }, { data: options }] = await Promise.all([
    db.from("questions").select("id, body, topic_id").in("id", picked),
    db.from("answer_options").select("id, question_id, body, position").in("question_id", picked).order("position"),
  ]);

  const qById = new Map(questions.map((q) => [q.id, q]));
  return json({
    attempt_id: attempt.id,
    started_at: attempt.started_at,
    total: picked.length,
    questions: picked.map((qid, i) => ({
      position: i + 1,
      id: qid,
      body: qById.get(qid).body,
      options: options
        .filter((o) => o.question_id === qid)
        .map((o) => ({ id: o.id, body: o.body })),
    })),
  }, 201);
});
