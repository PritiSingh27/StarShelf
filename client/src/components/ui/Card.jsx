export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-5 transition-shadow shadow-sm/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
