import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Если переменные не заданы, сайт всё равно открывается и показывает подсказку
export const configured = Boolean(url && key);

export const supabase = createClient(url || "http://localhost:54321", key || "not-configured");
