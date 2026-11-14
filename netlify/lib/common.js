import { createClient } from "@supabase/supabase-js";

// Серверный клиент с service_role: видит is_correct, обходит RLS.
// Поэтому каждая функция САМА проверяет, что попытка принадлежит пользователю.
export const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export const fail = (status, message) => json({ error: message }, status);

export function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getUser(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}

// Обёртка: метод, авторизация, разбор JSON, обработка ошибок.
export function route(method, handler) {
  return async (req) => {
    if (req.method !== method) return fail(405, "Метод не поддерживается");
    try {
      const user = await getUser(req);
      if (!user) return fail(401, "Требуется вход в аккаунт");

      let body = null;
      if (method === "POST") {
        try { body = await req.json(); } catch { return fail(400, "Некорректный JSON"); }
        if (!body || typeof body !== "object") return fail(400, "Некорректный JSON");
      }
      return await handler({ req, user, body });
    } catch (e) {
      console.error(e);
      return fail(500, "Внутренняя ошибка сервера");
    }
  };
}

// Достаёт попытку и проверяет, что она принадлежит пользователю.
export async function loadOwnAttempt(attemptId, userId, columns = "id, user_id, finished_at") {
  const { data } = await db.from("test_attempts").select(columns).eq("id", attemptId).maybeSingle();
  return data && data.user_id === userId ? data : null;
}
