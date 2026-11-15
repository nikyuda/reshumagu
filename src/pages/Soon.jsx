import { useState } from "react";
import { Link } from "react-router-dom";
import cat from "../assets/cat.png";
import think from "../assets/think.png";

export default function Soon() {
  const [pushed, setPushed] = useState(false);

  if (pushed) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col items-center gap-6 rounded-[32px] bg-leaf p-8 text-center md:rounded-[50px] md:p-10">
        <img src={think} alt="" className="max-h-[420px] w-full rounded-[30px] object-contain" />
        <button onClick={() => setPushed(false)} className="text-[17px] font-bold">
          Хочу сейчас!
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 rounded-[32px] bg-white p-8 text-center md:rounded-[50px] md:p-10">
      <img src={cat} alt="" className="h-[140px] w-auto rounded-3xl object-contain" />
      <h1 className="text-3xl font-extrabold tracking-[-0.01em]">Тесты скоро появятся</h1>
      <p className="max-w-md text-[17px] leading-[1.4] text-muted">
        Мы переводим программу вступительных испытаний в интерактивные тесты.
      </p>
      <button
        onClick={() => setPushed(true)}
        className="w-full rounded-full bg-leaf px-9 py-[18px] text-[17px] font-bold"
      >
        Хочу сейчас!
      </button>
      <Link to="/" className="text-sm font-semibold text-muted hover:text-black">На главную</Link>
    </div>
  );
}
