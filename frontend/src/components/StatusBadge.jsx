import { CheckCircle2, XCircle } from "lucide-react";

export default function StatusBadge({ valid }) {
  if (valid) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success-soft/15 border border-success-soft/40 text-success text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Valid Query
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-error-soft/15 border border-error-soft/40 text-error text-sm font-semibold">
      <XCircle className="w-4 h-4" />
      Invalid Query
    </div>
  );
}
