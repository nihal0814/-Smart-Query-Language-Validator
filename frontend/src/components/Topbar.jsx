import { Menu } from "lucide-react";

export default function Topbar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-border bg-bg/85 backdrop-blur px-4 md:px-8 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="md:hidden text-text-dim hover:text-text p-1.5 -ml-1.5"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="min-w-0">
        <h1 className="text-[15px] font-bold text-text tracking-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-faint font-mono truncate">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
