import { ScanLine, Workflow, Terminal, ListTree, ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    icon: ScanLine,
    title: "Regular Expressions",
    body: "Each kind of token — keywords like SELECT and FROM, identifiers, numbers, string literals, operators, punctuation — is defined by a regular expression. Regular expressions describe regular languages, the simplest class of formal languages in the Chomsky hierarchy.",
  },
  {
    icon: Terminal,
    title: "Lexical Analysis",
    body: "The lexer (app/lexer.py) is the 'scanning' phase of a compiler. It reads the raw query text left to right and groups characters into tokens — the smallest meaningful units of the language — discarding whitespace along the way.",
  },
  {
    icon: Workflow,
    title: "Finite Automata",
    body: "By Kleene's theorem, every regular expression has an equivalent Deterministic Finite Automaton (DFA). This project makes that equivalence concrete: app/dfa.py hand-simulates a DFA for identifiers and one for numbers, state by state, and the DFA Visualizer page lets you watch the simulation happen.",
  },
  {
    icon: ListTree,
    title: "Context-Free Grammar",
    body: "Regular expressions alone can't describe nested or sequential structure like 'SELECT ... FROM ... WHERE ...'. That needs a Context-Free Grammar (CFG) — a set of production rules over non-terminals. This project's grammar lives, as comments and code, in app/grammar.py.",
  },
  {
    icon: ShieldCheck,
    title: "Syntax Validation",
    body: "A recursive-descent parser — one function per grammar rule — walks the token stream against the CFG. Because the grammar is LL(1) (decidable with a single token of lookahead), this simple, direct style of parser is sufficient, and it can pinpoint exactly which rule failed and why.",
  },
];

export default function About() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 animate-fade-in-up max-w-3xl">
      <h2 className="text-xl font-bold text-text mb-2">About this project</h2>
      <p className="text-sm text-text-dim leading-relaxed mb-8">
        The Smart Query Language Validator is a Theory of Computation course project. It takes a
        small, SQL-like query language and builds a complete (if small) compiler front-end for
        it — lexer, automaton, grammar and parser — so the theory can be seen running rather than
        just read about. No query is ever executed and no external SQL parsing library is used;
        every rule is hand-written for this project.
      </p>

      <div className="space-y-5 mb-10">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <div className="w-9 h-9 rounded-lg bg-indigo/12 border border-indigo/25 flex items-center justify-center shrink-0">
              <Icon className="w-[18px] h-[18px] text-indigo" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text mb-1">{title}</h3>
              <p className="text-[13px] text-text-dim leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 mb-6">
        <h3 className="text-sm font-bold text-text mb-3">Tech stack</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] font-mono text-text-dim">
          <p><span className="text-text-faint">Frontend</span> · React + Vite</p>
          <p><span className="text-text-faint">Styling</span> · Tailwind CSS</p>
          <p><span className="text-text-faint">Icons</span> · lucide-react</p>
          <p><span className="text-text-faint">Backend</span> · Python + FastAPI</p>
          <p><span className="text-text-faint">Testing</span> · pytest</p>
          <p><span className="text-text-faint">Routing</span> · react-router-dom</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-bold text-text mb-2">Grammar summary</h3>
        <pre className="text-[12.5px] font-mono text-text-dim leading-relaxed overflow-x-auto">
{`<query>   ::= SELECT <columns> FROM <table> <where>? ;
<columns> ::= "*" | <id> ("," <id>)*
<table>   ::= <id>
<where>   ::= WHERE <id> <op> <value>
<op>      ::= "=" | ">" | "<" | ">=" | "<=" | "!="
<value>   ::= NUMBER | STRING | <id>`}
        </pre>
      </div>
    </div>
  );
}
