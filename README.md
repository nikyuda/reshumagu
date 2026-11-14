# РешуМагу

React + Vite + Tailwind, Supabase (база и вход), Netlify Functions (проверка ответов).

## Переменные окружения (Netlify → Project configuration → Environment variables)
- `VITE_SUPABASE_URL` — адрес проекта Supabase (публичный)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — ключ `sb_publishable_...` (публичный)
- `SUPABASE_URL` — тот же адрес (для функций)
- `SUPABASE_SERVICE_ROLE_KEY` — ключ `sb_secret_...` (секретный, только для функций)

## Команды
- `npm install`
- `npm run build` — сборка в `dist/` (так делает Netlify)
- `netlify dev` — локальный запуск вместе с функциями (обычный `npm run dev` запускает только сайт)
