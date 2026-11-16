# РешуМагу

React + Vite + Tailwind, Supabase (база и вход), Netlify Functions (проверка ответов).

## Переменные окружения (Netlify → Project configuration → Environment variables)
- `VITE_SUPABASE_URL` — адрес проекта Supabase 
- `VITE_SUPABASE_PUBLISHABLE_KEY` — ключ `sb_publishable_...` 
- `SUPABASE_URL` — тот же адрес (для функций)
- `SUPABASE_SERVICE_ROLE_KEY` — ключ `sb_secret_...` 

## Команды
- `npm install`
- `npm run build` — сборка в `dist/` 
- `netlify dev` — локальный запуск вместе с функциями 
