import { useState } from "react";
import { Play, CheckCircle2, XCircle, Loader2, WifiOff, ArrowRight, RotateCcw } from "lucide-react";
import { api } from "../lib/api";
import StateDiagram from "../components/StateDiagram";
import RegexDfaDiagram from "../components/RegexDfaDiagram";

function RegexTester() {
  const [regex, setRegex] = useState("(a|b)*abb");
  const [testString, setTestString] = useState("aabb");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await api.regexDfa(regex, testString));
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo/30 bg-surface overflow-hidden shadow-xl shadow-indigo/5">
      <div className="p-5 border-b border-border bg-gradient-to-r from-indigo/10 to-transparent">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-text-faint">Regular expression</span>
            <input value={regex} onChange={(event) => setRegex(event.target.value)} onKeyDown={(event) => event.key === "Enter" && run()} className="mt-2 w-full bg-bg border border-border rounded-lg px-3.5 py-3 font-mono text-sm text-text focus:outline-none focus:border-indigo/60" placeholder="(a|b)*abb" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-text-faint">Test string</span>
            <input value={testString} onChange={(event) => setTestString(event.target.value)} onKeyDown={(event) => event.key === "Enter" && run()} className="mt-2 w-full bg-bg border border-border rounded-lg px-3.5 py-3 font-mono text-sm text-text focus:outline-none focus:border-indigo/60" placeholder="aabb" />
          </label>
          <button onClick={run} disabled={loading} className="inline-flex items-center justify-center gap-2 bg-indigo hover:bg-indigo-soft disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Generate DFA
          </button>
        </div>
        <p className="text-xs text-text-faint mt-3 font-mono">Supported syntax: union <span className="text-indigo">|</span>, grouping <span className="text-indigo">( )</span>, repetition <span className="text-indigo">*</span>, and literal characters.</p>
      </div>
      <div className="p-5 bg-bg/60">
        {error && <p className="mb-4 text-xs font-mono text-error">{error}</p>}
        {!result && !error && <p className="text-sm text-text-faint text-center py-10">Enter a regex and test string, then generate its DFA.</p>}
        {result && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-faint">Generated DFA</span>
              <span className="text-[11px] font-mono text-text-faint">Alphabet: {"{"}{result.alphabet.join(", ")}{"}"}</span>
            </div>
            <div className="rounded-xl bg-bg border border-border-soft p-3">
              <RegexDfaDiagram dfa={result} path={result.path} />
            </div>
            <div className={`mt-4 rounded-xl border p-4 ${result.accepted ? "border-success-soft/40 bg-success-soft/10" : "border-error-soft/40 bg-error-soft/10"}`}>
              <div className={`flex items-center gap-2 text-sm font-bold ${result.accepted ? "text-success" : "text-error"}`}>
                {result.accepted ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {result.accepted ? "Test string accepted" : "Test string rejected"}
              </div>
              <p className="text-xs text-text-dim font-mono mt-2">{result.reason}</p>
              <p className="text-xs text-text-faint font-mono mt-2">Path: {result.path.join(" → ") || "q0"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Tester({ kind, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connError, setConnError] = useState(false);
  const examples = kind === "identifier" ? ["student_1", "_temp", "1student"] : ["8.5", "42", "12."];

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
    <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xl shadow-black/10">
      <div className="p-5 border-b border-border bg-surface-raised">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor={`${kind}-input`} className="text-xs font-bold uppercase tracking-wider text-text-faint">
            Input string
          </label>
          {result && (
            <button onClick={() => setResult(null)} className="inline-flex items-center gap-1 text-xs text-text-faint hover:text-text transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            id={`${kind}-input`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(value)}
            placeholder={kind === "identifier" ? "e.g. student_1" : "e.g. 8.5"}
            spellCheck={false}
            className="flex-1 bg-bg border border-border rounded-lg px-3.5 py-3 font-mono text-sm text-text placeholder-text-faint focus:outline-none focus:border-indigo/60 focus:ring-2 focus:ring-indigo/20"
          />
          <button
            onClick={() => run(value)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-indigo hover:bg-indigo-soft disabled:opacity-60 transition-colors text-white text-sm font-semibold px-5 py-3 rounded-lg shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run DFA
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[11px] text-text-faint self-center">Try:</span>
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => { setValue(example); run(example); }}
              className="px-2.5 py-1 rounded-md border border-border text-[11px] font-mono text-text-dim hover:border-indigo/60 hover:text-indigo transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 bg-bg/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-text-faint">Automaton output</span>
          {result && <span className="text-[11px] font-mono text-text-faint">{result.path.length - 1} symbols consumed</span>}
        </div>
      <div className="rounded-xl bg-bg border border-border-soft p-3">
        <StateDiagram kind={kind} activePath={result?.path || []} />
      </div>

        {connError && (
          <div className="mt-4 flex items-center gap-2 text-error text-xs font-mono">
            <WifiOff className="w-4 h-4" /> Can't reach the backend API.
          </div>
        )}

        {result && !connError && (
          <div className="mt-4 space-y-4">
            <div className={`rounded-xl border p-4 ${
              result.accepted
                ? "border-success-soft/40 bg-success-soft/10"
                : "border-error-soft/40 bg-error-soft/10"
            }`}>
              <div className={`flex items-center gap-2 text-sm font-bold ${result.accepted ? "text-success" : "text-error"}`}>
                {result.accepted ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {result.accepted ? "Input accepted" : "Input rejected"}
              </div>
              <p className="text-xs text-text-dim font-mono leading-relaxed mt-2">{result.reason}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-faint mb-2">Transition trace</p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-raised text-text-faint">
                    <tr><th className="px-3 py-2 font-medium">Step</th><th className="px-3 py-2 font-medium">Read</th><th className="px-3 py-2 font-medium">Transition</th></tr>
                  </thead>
                  <tbody>
                    {result.symbols.map((symbol, index) => (
                      <tr key={`${symbol}-${index}`} className="border-t border-border text-text-dim">
                        <td className="px-3 py-2 text-text-faint">{index + 1}</td>
                        <td className="px-3 py-2 text-cyan">{symbol === " " ? "space" : symbol}</td>
                        <td className="px-3 py-2"><span className="text-text">{result.path[index]}</span><ArrowRight className="inline mx-2 w-3 h-3 text-text-faint" /><span className={result.path[index + 1] === "qE" ? "text-error" : "text-success"}>{result.path[index + 1]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DFAVisualizer() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 animate-fade-in-up space-y-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo/30 bg-indigo/10 px-3 py-1 text-[11px] font-mono text-indigo mb-3">
          INPUT <ArrowRight className="w-3 h-3" /> DFA <ArrowRight className="w-3 h-3" /> OUTPUT
        </div>
        <h2 className="text-2xl font-bold text-text mb-2">Turn a string into a DFA trace</h2>
        <p className="text-sm text-text-dim leading-relaxed">
          A Deterministic Finite Automaton is a 5-tuple <code className="font-mono text-indigo">(Q, Σ, δ, q₀, F)</code> —
          a finite set of states, an input alphabet, a transition function, a start state, and a
          set of accepting states. Type a string below and step through exactly how each DFA
          reads it, one character at a time.
        </p>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-sm font-bold text-text">Regex to DFA</h3>
          <code className="text-xs font-mono text-text-faint">automata construction</code>
        </div>
        <p className="text-[13px] text-text-dim mb-4 leading-relaxed max-w-3xl">
          Enter a regular expression and a string. The backend builds a DFA from the expression and highlights the exact path taken by the test string.
        </p>
        <RegexTester />
      </section>

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
          <code className="text-xs font-mono text-text-faint">[0-9]+(\.[0-9]+)?</code>
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
