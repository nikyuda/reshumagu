import { supabase } from "./supabase.js";

// Вызов наших Netlify-функций с токеном текущего пользователя
async function call(path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? "";

  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Ошибка запроса к серверу");
  return json;
}

export const startTest = (params) => call("start-test", params);
export const checkAnswer = (params) => call("check-answer", params);
export const finishTest = (params) => call("finish-test", params);
