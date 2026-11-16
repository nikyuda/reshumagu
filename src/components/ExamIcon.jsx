export default function ExamIcon({ title = "", size = 44 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 44 44",
    fill: "none",
    stroke: "white",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (/дизайн/i.test(title)) {
    return (
      <svg {...common}>
        <rect x="5" y="6" width="34" height="23" rx="3" />
        <path d="M17 38h10M22 29v9M14 22l6-8 5 5 5-7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M15 14 7 22l8 8M29 14l8 8-8 8M25 10l-6 24" />
    </svg>
  );
}
