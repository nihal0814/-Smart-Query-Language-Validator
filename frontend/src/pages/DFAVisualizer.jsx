import { useState } from "react";
import { Play, CheckCircle2, XCircle, Loader2, WifiOff } from "lucide-react";
import { api } from "../lib/api";
import StateDiagram from "../components/StateDiagram";

function Tester({ kind, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connError, setConnError] = useState(false);

  const run = async (v) => {
    setLoading(true);
    setConnError(false);
    try {
      const data = await api.dfaCheck(v, kind);
      setResult(data);
    } catch {
      setConnError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(value)}
          placeholder={kind === "identifier" ? "e.g. student_1" : "e.g. 8.5"}
          spellCheck={false}
          className="flex-1 bg-bg border border-border rounded-lg px-3.5 py-2 font-mono text-sm text-text placeholder-text-faint focus:outline-none focus:border-indigo/60"
        />
        <button
          onClick={() => run(value)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-indigo hover:bg-indigo-soft disabled:opacity-60 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run DFA
        </button>
      </div>

      <div className="rounded-lg bg-bg border border-border-soft p-3 mb-4">
        <StateDiagram kind={kind} activePath={result?.path || []} />
      </div>

      {connError && (
        <div className="flex items-center gap-2 text-error text-xs font-mono">
          <WifiOff className="w-4 h-4" /> Can't reach the backend API.
        </div>
      )}

      {result && !connError && (
        <div className="space-y-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${
            result.accepted
              ? "text-success bg-success-soft/15 border-success-soft/40"
              : "text-error bg-error-soft/15 border-error-soft/40"
          }`}>
            {result.accepted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.accepted ? "Accepted" : "Rejected"}
          </div>
          <p className="text-xs text-text-dim font-mono leading-relaxed">{result.reason}</p>
          <p className="text-xs font-mono text-text-faint">
            Path: <span className="text-indigo">{result.path.join(" → ")}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default function DFAVisualizer() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 animate-fade-in-up space-y-10">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-text mb-2">DFA Visualizer</h2>
        <p className="text-sm text-text-dim leading-relaxed">
          A Deterministic Finite Automaton is a 5-tuple <code className="font-mono text-indigo">(Q, Σ, δ, q₀, F)</code> —
          a finite set of states, an input alphabet, a transition function, a start state, and a
          set of accepting states. Type a string below and step through exactly how each DFA
          reads it, one character at a time.
        </p>
      </div>

      {/* Identifier DFA */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-bold text-text">Identifier DFA</h3>
          <code className="text-xs font-mono text-text-faint">[A-Za-z_][A-Za-z0-9_]*</code>
        </div>
        <p className="text-[13px] text-text-dim mb-4 leading-relaxed max-w-2xl">
          Starts in <code className="font-mono text-indigo">q0</code>. Any letter or underscore moves it to the
          accepting state <code className="font-mono text-success">q1</code>, where it can loop on letters, digits,
          or underscores forever. Starting with a digit — or hitting an illegal character — sends it to the
          dead state <code className="font-mono text-error">qE</code>, which it can never leave.
        </p>
        <Tester kind="identifier" defaultValue="student_1" />
      </section>

      {/* Number DFA */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-bold text-text">Number DFA</h3>
          <code className="text-xs font-mono text-text-faint">[0-9]+(.[0-9]+)?</code>
        </div>
        <p className="text-[13px] text-text-dim mb-4 leading-relaxed max-w-2xl">
          Starts in <code className="font-mono text-indigo">q0</code>. One or more digits reach the accepting state{" "}
          <code className="font-mono text-success">q1</code> (a valid integer). A decimal point moves it to the
          non-accepting <code className="font-mono text-warning">q2</code> — it must see at least one more digit to
          reach the other accepting state <code className="font-mono text-success">q3</code>. Anything else falls to{" "}
          <code className="font-mono text-error">qE</code>.
        </p>
        <Tester kind="number" defaultValue="8.5" />
      </section>
    </div>
  );
}
