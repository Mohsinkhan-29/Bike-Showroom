export default function SpecPlate({ specs = {}, className = "" }) {
  return (
    <div className={`spec-plate ${className}`}>
      <span className="rivet top-2 left-2" />
      <span className="rivet bottom-2 right-2" />
      <dl className="space-y-1.5">
        {Object.entries(specs).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm border-b border-steel-line/60 last:border-0 pb-1.5 last:pb-0">
            <dt className="text-chrome-light font-mono text-xs uppercase tracking-wide">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
