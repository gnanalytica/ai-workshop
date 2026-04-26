interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
  total?: number;
}

export function Sparkline({ data, width = 120, height = 32, label, total }: SparklineProps) {
  const max = Math.max(1, ...data);
  const min = 0;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = data[data.length - 1] ?? 0;

  return (
    <div className="flex flex-col">
      {label && (
        <div className="flex items-baseline justify-between">
          <span className="text-muted text-xs uppercase tracking-wider">{label}</span>
          <span className="text-ink text-xs font-semibold">
            {total ?? last}
          </span>
        </div>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="text-accent mt-1 w-full"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
