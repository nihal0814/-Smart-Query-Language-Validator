const TYPE_STYLES = {
  KEYWORD: "text-indigo bg-indigo/10 border-indigo/30",
  IDENTIFIER: "text-cyan bg-cyan/10 border-cyan/30",
  NUMBER: "text-warning bg-warning/10 border-warning/30",
  STRING: "text-success bg-success/10 border-success/30",
  OPERATOR: "text-[#f0abfc] bg-[#f0abfc]/10 border-[#f0abfc]/30",
  COMMA: "text-text-dim bg-white/5 border-border",
  SEMICOLON: "text-text-dim bg-white/5 border-border",
  STAR: "text-text-dim bg-white/5 border-border",
  UNKNOWN: "text-error bg-error/10 border-error/30",
};

export default function TokenTable({ tokens }) {
  if (!tokens || tokens.length === 0) {
    return (
      <p className="text-sm text-text-faint font-mono py-6 text-center">
        No tokens yet — run a query to see the token stream.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-left text-text-faint text-xs uppercase tracking-wide">
            <th className="pb-2 pr-4 font-medium">#</th>
            <th className="pb-2 pr-4 font-medium">Lexeme</th>
            <th className="pb-2 pr-4 font-medium">Token Type</th>
            <th className="pb-2 font-medium">Position</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, i) => (
            <tr key={i} className="border-t border-border-soft">
              <td className="py-2 pr-4 text-text-faint">{i + 1}</td>
              <td className="py-2 pr-4 text-text">{t.value}</td>
              <td className="py-2 pr-4">
                <span
                  className={`inline-block px-2 py-0.5 rounded border text-xs ${
                    TYPE_STYLES[t.type] || "text-text-dim bg-white/5 border-border"
                  }`}
                >
                  {t.type}
                </span>
              </td>
              <td className="py-2 text-text-faint">{t.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
