// Hand-laid-out SVG diagrams for the two DFAs used in this project.
// Positions are fixed per diagram (only 3–5 states each) so the arrows and
// labels can be placed legibly — a fully generic auto-layout isn't worth
// the complexity for a diagram this small.

const IDENTIFIER_NODES = {
  q0: { x: 90, y: 130 },
  q1: { x: 330, y: 130 },
  qE: { x: 330, y: 270 },
};

const NUMBER_NODES = {
  q0: { x: 70, y: 130 },
  q1: { x: 220, y: 130 },
  q2: { x: 370, y: 130 },
  q3: { x: 520, y: 130 },
  qE: { x: 295, y: 270 },
};

function Node({ id, x, y, accepting, active }) {
  const r = 26;
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={active ? "rgba(99,102,241,0.25)" : "#151a25"}
        stroke={active ? "#6366f1" : accepting ? "#34d399" : "#2a3142"}
        strokeWidth={active ? 2.5 : 1.5}
      />
      {accepting && (
        <circle cx={x} cy={y} r={r - 5} fill="none" stroke="#34d399" strokeWidth={1.2} />
      )}
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="13"
        fontWeight="600"
        fill={active ? "#e6e9f2" : "#9aa3b8"}
      >
        {id}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, curveUp, active }) {
  // Slightly offset endpoints so the arrowhead doesn't sit inside the node.
  const stroke = active ? "#6366f1" : "#3a4256";
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - (curveUp ? 34 : 0);
  const path = curveUp ? `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <g>
      <path d={path} fill="none" stroke={stroke} strokeWidth={active ? 2 : 1.3} markerEnd="url(#arrowhead)" opacity={active ? 1 : 0.8} />
      <text
        x={mx}
        y={my - (curveUp ? 6 : 8)}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="10.5"
        fill={active ? "#9aa3f6" : "#5c6478"}
      >
        {label}
      </text>
    </g>
  );
}

function SelfLoop({ x, y, label, active }) {
  const stroke = active ? "#6366f1" : "#3a4256";
  return (
    <g>
      <path
        d={`M ${x - 14} ${y - 24} C ${x - 34} ${y - 62}, ${x + 34} ${y - 62}, ${x + 14} ${y - 24}`}
        fill="none"
        stroke={stroke}
        strokeWidth={active ? 2 : 1.3}
        markerEnd="url(#arrowhead)"
        opacity={active ? 1 : 0.8}
      />
      <text x={x} y={y - 58} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill={active ? "#9aa3f6" : "#5c6478"}>
        {label}
      </text>
    </g>
  );
}

export default function StateDiagram({ kind, activePath = [] }) {
  const nodes = kind === "identifier" ? IDENTIFIER_NODES : NUMBER_NODES;
  const accepting = kind === "identifier" ? ["q1"] : ["q1", "q3"];
  const activeSet = new Set(activePath);

  // An edge is "active" if both its endpoints are consecutive states in the
  // simulated path (i.e. the automaton actually took that transition).
  const wasTaken = (a, b) => {
    for (let i = 0; i < activePath.length - 1; i++) {
      if (activePath[i] === a && activePath[i + 1] === b) return true;
    }
    return false;
  };

  return (
    <svg viewBox={kind === "identifier" ? "0 0 420 330" : "0 0 600 330"} className="w-full h-auto">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#6366f1" />
        </marker>
      </defs>

      {/* start-state arrow */}
      <Arrow x1={nodes.q0.x - 55} y1={nodes.q0.y} x2={nodes.q0.x - 27} y2={nodes.q0.y} label="start" active={activeSet.has("q0")} />

      {kind === "identifier" ? (
        <>
          <Arrow x1={nodes.q0.x + 26} y1={nodes.q0.y} x2={nodes.q1.x - 26} y2={nodes.q1.y} label="letter, _" active={wasTaken("q0", "q1")} />
          <SelfLoop x={nodes.q1.x} y={nodes.q1.y} label="letter, digit, _" active={wasTaken("q1", "q1")} />
          <Arrow x1={nodes.q0.x + 12} y1={nodes.q0.y + 22} x2={nodes.qE.x - 40} y2={nodes.qE.y - 18} label="digit / other" active={wasTaken("q0", "qE")} />
          <Arrow x1={nodes.q1.x} y1={nodes.q1.y + 26} x2={nodes.qE.x} y2={nodes.qE.y - 26} label="other" active={wasTaken("q1", "qE")} />
          <SelfLoop x={nodes.qE.x} y={nodes.qE.y} label="any" active={wasTaken("qE", "qE")} />
        </>
      ) : (
        <>
          <Arrow x1={nodes.q0.x + 26} y1={nodes.q0.y} x2={nodes.q1.x - 26} y2={nodes.q1.y} label="digit" active={wasTaken("q0", "q1")} />
          <SelfLoop x={nodes.q1.x} y={nodes.q1.y} label="digit" active={wasTaken("q1", "q1")} />
          <Arrow x1={nodes.q1.x + 26} y1={nodes.q1.y} x2={nodes.q2.x - 26} y2={nodes.q2.y} label="." active={wasTaken("q1", "q2")} />
          <Arrow x1={nodes.q2.x + 26} y1={nodes.q2.y} x2={nodes.q3.x - 26} y2={nodes.q3.y} label="digit" active={wasTaken("q2", "q3")} />
          <SelfLoop x={nodes.q3.x} y={nodes.q3.y} label="digit" active={wasTaken("q3", "q3")} />
          <Arrow x1={nodes.q0.x} y1={nodes.q0.y + 26} x2={nodes.qE.x - 90} y2={nodes.qE.y - 10} label="other" active={wasTaken("q0", "qE")} />
          <Arrow x1={nodes.q1.x - 10} y1={nodes.q1.y + 26} x2={nodes.qE.x - 20} y2={nodes.qE.y - 26} label="other" active={wasTaken("q1", "qE")} />
          <Arrow x1={nodes.q2.x} y1={nodes.q2.y + 26} x2={nodes.qE.x + 20} y2={nodes.qE.y - 26} label="other" active={wasTaken("q2", "qE")} />
          <Arrow x1={nodes.q3.x + 10} y1={nodes.q3.y + 26} x2={nodes.qE.x + 90} y2={nodes.qE.y - 10} label="other" active={wasTaken("q3", "qE")} />
          <SelfLoop x={nodes.qE.x} y={nodes.qE.y} label="any" active={wasTaken("qE", "qE")} />
        </>
      )}

      {Object.entries(nodes).map(([id, pos]) => (
        <Node key={id} id={id} x={pos.x} y={pos.y} accepting={accepting.includes(id)} active={activeSet.has(id)} />
      ))}
    </svg>
  );
}
