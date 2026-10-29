import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Validator from "./pages/Validator";
import DFAVisualizer from "./pages/DFAVisualizer";
import About from "./pages/About";

const PAGE_META = {
  "/": { title: "Dashboard", subtitle: "project overview" },
  "/validator": { title: "Query Validator", subtitle: "lexer · parser · grammar" },
  "/dfa": { title: "DFA Visualizer", subtitle: "finite automata" },
  "/about": { title: "About", subtitle: "TOC concepts" },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: "Smart Query Language Validator" };

  return (
    <div className="min-h-screen flex bg-bg bg-grid">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/validator" element={<Validator />} />
            <Route path="/dfa" element={<DFAVisualizer />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="px-4 md:px-8 py-5 text-[11px] font-mono text-text-faint border-t border-border">
          Smart Query Language Validator · Theory of Computation project
        </footer>
      </div>
    </div>
  );
}
