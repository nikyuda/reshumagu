import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function University() {
  const { id } = useParams();
  const [uni, setUni] = useState(undefined); // undefined — загрузка, null — не найден

  useEffect(() => {
    supabase
      .from("universities")
      .select("id, short_name, name, exams(id, title)")
      .eq("id", Number(id))
      .maybeSingle()
      .then(({ data }) => setUni(data));
  }, [id]);

  if (uni === undefined) return <p className="py-10 text-neutral-500">Загрузка…</p>;
  if (uni === null) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-extrabold">Вуз не найден</h1>
        <Link to="/" className="btn-brand mt-4">На главную</Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-neutral-500">
        <Link to="/" className="hover:underline">Главная</Link> / {uni.short_name}
      </p>
      <div className="card">
        <h1 className="text-3xl font-extrabold md:text-4xl">{uni.name}</h1>
        <p className="mt-4 font-semibold">Выберите экзамен:</p>
        <div className="mt-3 flex flex-col gap-3">
          {(uni.exams ?? []).map((e) => (
            <Link
              key={e.id}
              to={`/exam/${e.id}`}
              className="rounded-2xl bg-accent px-5 py-4 font-bold text-white transition hover:bg-accent/90"
            >
              {e.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
