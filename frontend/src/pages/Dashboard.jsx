import { Link } from "react-router-dom";
import {
  ArrowRight, Terminal, Workflow, ScanLine, ListTree, ShieldCheck, CheckCircle2,
} from "lucide-react";

const CONCEPTS = [
  {
    icon: ScanLine,
    title: "Regular Expressions",
    desc: "Every token type — keywords, identifiers, numbers, operators — is defined as a regular expression pattern.",
  },
  {
    icon: Workflow,
    title: "Finite Automata",
    desc: "Identifiers and numbers are validated by simulating hand-built DFAs, state by state, character by character.",
  },
  {
    icon: Terminal,
    title: "Lexical Analysis",
    desc: "The lexer scans raw query text and converts it into a clean stream of classified tokens.",
  },
  {
    icon: ListTree,
    title: "Context-Free Grammar",
    desc: "A small CFG defines what a legal query looks like, expressed as production rules over the token stream.",
  },
  {
    icon: ShieldCheck,
    title: "Syntax Validation",
    desc: "A recursive-descent parser walks the grammar rules and reports the exact reason a query fails.",
  },
];

const EXAMPLE_QUERY = "SELECT name FROM students WHERE age > 18;";

export default function Dashboard() {
  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="px-4 md:px-8 pt-10 md:pt-14 pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan bg-cyan/10 border border-cyan/25 rounded-full px-3 py-1 mb-5">
            Theory of Computation · College Project
          </div>
          <h1 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight text-text leading-[1.1]">
            Smart Query Language Validator
          </h1>
          <p className="mt-4 text-[15px] md:text-base text-text-dim leading-relaxed max-w-2xl">
            A small compiler front-end for a SQL-like query language. Type a query and watch
            it get scanned into tokens, walked through a finite automaton, and checked
            against a context-free grammar — with every step shown, not hidden.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/validator"
              className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo-soft transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              Open the Validator
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dfa"
              className="inline-flex items-center gap-2 border border-border hover:border-indigo/50 hover:text-text transition-colors text-text-dim text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              See the DFA
            </Link>
          </div>
        </div>
      </section>

      {/* Quick example terminal */}
      <section className="px-4 md:px-8 pb-10">
        <div className="max-w-3xl rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-surface-raised">
            <span className="w-2.5 h-2.5 rounded-full bg-error-soft/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-success-soft/70" />
            <span className="ml-3 text-xs font-mono text-text-faint">example.sql</span>
          </div>
          <div className="p-5 font-mono text-sm">
            <p className="text-text-dim">
              <span className="text-text-faint">1</span>
              <span className="ml-4">
                <span className="text-indigo">SELECT</span>{" "}
                <span className="text-cyan">name</span>{" "}
                <span className="text-indigo">FROM</span>{" "}
                <span className="text-cyan">students</span>{" "}
                <span className="text-indigo">WHERE</span>{" "}
                <span className="text-cyan">age</span>{" "}
                <span className="text-[#f0abfc]">&gt;</span>{" "}
                <span className="text-warning">18</span>
                <span className="text-text-dim">;</span>
                <span className="cursor-blink text-text">▍</span>
              </span>
            </p>
            <div className="mt-4 flex items-center gap-2 text-success text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              5 tokens · grammar accepted
            </div>
          </div>
        </div>
        <Link
          to={`/validator?q=${encodeURIComponent(EXAMPLE_QUERY)}`}
          className="inline-block mt-3 text-xs font-mono text-text-faint hover:text-indigo transition-colors"
        >
          → try this exact query in the validator
        </Link>
      </section>

      {/* Concepts grid */}
      <section className="px-4 md:px-8 pb-14">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-faint mb-4">
          What's under the hood
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONCEPTS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface p-5 hover:border-indigo/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo/12 border border-indigo/25 flex items-center justify-center mb-3.5">
                <Icon className="w-[18px] h-[18px] text-indigo" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-text mb-1.5">{title}</h3>
              <p className="text-[13px] text-text-dim leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
