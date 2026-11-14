import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md text-center">
      <div className="text-7xl font-extrabold text-brand">404</div>
      <h1 className="mt-2 text-2xl font-extrabold">Такой страницы нет</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Ссылка устарела или не существует. Вернитесь на главную.
      </p>
      <Link to="/" className="btn-brand mt-5">На главную</Link>
    </div>
  );
}
