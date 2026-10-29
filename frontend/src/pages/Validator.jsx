import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Play, AlertTriangle, Loader2, WifiOff, ListChecks } from "lucide-react";
import { api } from "../lib/api";
import StatusBadge from "../components/StatusBadge";
import TokenTable from "../components/TokenTable";

const EXAMPLES = [
  "SELECT name FROM students;",
  "SELECT name, age FROM students;",
  "SELECT name FROM students WHERE age > 18;",
  "SELECT * FROM students WHERE gpa >= 8.5;",
  "SELECT name students;",
  "SELECT name FROM WHERE age > 18;",
];

export default function Validator() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "SELECT name FROM students WHERE age > 18;");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connError, setConnError] = useState(false);

  const runValidation = useCallback(async (q) => {
    setLoading(true);
    setConnError(false);
    try {
      const data = await api.validate(q);
      setResult(data);
    } catch (err) {
      setConnError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate once on first load (covers the ?q= deep link from the Dashboard)
  useEffect(() => {
    runValidation(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 animate-fade-in-up">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: input */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised">
              <span className="text-xs font-mono text-text-faint">query.sql</span>
              <span className="text-[11px] font-mono text-text-faint">{query.length} chars</span>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full bg-transparent p-4 font-mono text-sm text-text placeholder-text-faint resize-none focus:outline-none"
              placeholder="SELECT name FROM students;"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <button
                onClick={() => runValidation(query)}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo-soft disabled:opacity-60 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Validate Query
              </button>
              {result && !loading && <StatusBadge valid={result.valid} />}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-faint mb-3">
              Example queries
            </p>
            <div className="flex flex-col gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    runValidation(ex);
                  }}
                  className="text-left font-mono text-[12.5px] text-text-dim hover:text-indigo hover:bg-indigo/5 rounded-md px-2.5 py-1.5 transition-colors truncate"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className="space-y-4">
          {connError && (
            <div className="rounded-xl border border-error-soft/40 bg-error-soft/10 p-4 flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-error">Can't reach the backend API</p>
                <p className="text-xs text-text-dim mt-1 leading-relaxed">
                  Make sure the FastAPI server is running (see the README) and that
                  <code className="font-mono bg-white/5 px-1 py-0.5 rounded mx-1">VITE_API_URL</code>
                  points to it.
                </p>
              </div>
            </div>
          )}

          {result && !connError && (
            <>
              {result.errors.length > 0 && (
                <div className="rounded-xl border border-error-soft/40 bg-error-soft/10 p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <AlertTriangle className="w-4 h-4 text-error" />
                    <p className="text-sm font-bold text-error">
                      {result.errors.length} error{result.errors.length > 1 ? "s" : ""} found
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-[13px] font-mono text-text-dim leading-relaxed pl-3 border-l-2 border-error-soft/50">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks className="w-4 h-4 text-indigo" />
                  <p className="text-sm font-bold text-text">Token List</p>
                  <span className="text-xs font-mono text-text-faint ml-auto">{result.tokens.length} tokens</span>
                </div>
                <TokenTable tokens={result.tokens} />
              </div>

              {result.grammar_trace?.length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-sm font-bold text-text mb-3">Grammar Rules Applied</p>
                  <ol className="space-y-1.5">
                    {result.grammar_trace.map((rule, i) => (
                      <li key={i} className="text-[12.5px] font-mono text-text-dim flex gap-2">
                        <span className="text-text-faint shrink-0">{i + 1}.</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
