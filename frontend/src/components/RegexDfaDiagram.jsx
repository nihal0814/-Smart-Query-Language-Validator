function State({ id, x, accepting, active }) {
  return (
    <g>
      <circle cx={x} cy="115" r="28" fill={active ? "rgba(99,102,241,0.28)" : "#151a25"} stroke={active ? "#818cf8" : accepting ? "#34d399" : "#2a3142"} strokeWidth={active ? 3 : 1.5} />
      {accepting && <circle cx={x} cy="115" r="22" fill="none" stroke="#34d399" strokeWidth="1.2" />}
      <text x={x} y="120" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill={active ? "#fff" : "#9aa3b8"}>{id}</text>
    </g>
  );
}

export default function RegexDfaDiagram({ dfa, path = [] }) {
  if (!dfa) return null;

  const width = Math.max(620, dfa.states.length * 145);
  const positions = Object.fromEntries(dfa.states.map((state, index) => [state, 75 + index * 135]));
  const active = path[path.length - 1];
  const transitions = dfa.transitions || [];
  const used = (from, to) => path.some((state, index) => state === from && path[index + 1] === to);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} 245`} className="min-w-[620px] w-full h-auto">
        <defs>
          <marker id="regex-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
          </marker>
        </defs>
        <text x="18" y="119" fill="#5c6478" fontFamily="JetBrains Mono, monospace" fontSize="11">start</text>
        <path d={`M 48 115 L ${positions[dfa.start] - 30} 115`} stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#regex-arrow)" />
        {transitions.map(({ from, symbol, to }) => {
          const x1 = positions[from];
          const x2 = positions[to];
          const isLoop = from === to;
          const taken = used(from, to);
          return (
            <g key={`${from}-${symbol}-${to}`}>
              <path d={isLoop ? `M ${x1 - 14} 88 C ${x1 - 34} 38, ${x1 + 34} 38, ${x1 + 14} 88` : `M ${x1 + 28} 115 L ${x2 - 28} 115`} fill="none" stroke={taken ? "#818cf8" : "#3a4256"} strokeWidth={taken ? 2.5 : 1.2} markerEnd="url(#regex-arrow)" />
              <text x={isLoop ? x1 : (x1 + x2) / 2} y={isLoop ? 32 : 105} textAnchor="middle" fill={taken ? "#a5b4fc" : "#5c6478"} fontFamily="JetBrains Mono, monospace" fontSize="10">{symbol}</text>
            </g>
          );
        })}
        {dfa.states.map((state) => (
          <State key={state} id={state} x={positions[state]} accepting={dfa.accepting.includes(state)} active={state === active} />
        ))}
      </svg>
    </div>
  );
}
