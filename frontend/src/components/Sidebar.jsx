import { NavLink } from "react-router-dom";
import { LayoutDashboard, Terminal, Workflow, Info, GitBranch, X } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/validator", label: "Query Validator", icon: Terminal },
  { to: "/dfa", label: "DFA Visualizer", icon: Workflow },
  { to: "/about", label: "About", icon: Info },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 md:z-0 top-0 left-0 h-full w-64 shrink-0
          bg-surface border-r border-border flex flex-col
          transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo to-cyan flex items-center justify-center">
              <GitBranch className="w-[18px] h-[18px] text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-bold tracking-tight text-text">SQL Validator</p>
              <p className="text-[10px] font-mono text-text-faint">TOC · v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-text-dim hover:text-text p-1"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? "bg-indigo/15 text-text border border-indigo/30"
                   : "text-text-dim hover:text-text hover:bg-white/5 border border-transparent"}`
              }
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <p className="text-[11px] font-mono text-text-faint leading-relaxed">
            Regex · DFA · Lexer<br />CFG · Parser
          </p>
        </div>
      </aside>
    </>
  );
}
