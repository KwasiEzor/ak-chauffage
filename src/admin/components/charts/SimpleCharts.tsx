interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
}

interface DonutChartProps {
  data: DataPoint[];
  colors: string[];
  size?: number;
  strokeWidth?: number;
}

const chartTextClass = 'text-xs text-zinc-500';
const SVG_WIDTH = 640;

function clampMax(values: number[]) {
  return Math.max(...values, 1);
}

function formatCompactValue(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }

  return value.toString();
}

function createLinePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export function SimpleLineChart({ data, height = 240 }: LineChartProps) {
  if (data.length === 0) {
    return <div className={`${chartTextClass} flex h-full items-center justify-center`}>Aucune donnée</div>;
  }

  const topPadding = 24;
  const bottomPadding = 34;
  const leftPadding = 20;
  const rightPadding = 16;
  const svgHeight = height;
  const plotWidth = SVG_WIDTH - leftPadding - rightPadding;
  const plotHeight = svgHeight - topPadding - bottomPadding;
  const maxValue = clampMax(data.map((point) => point.value));
  const xStep = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  const points = data.map((point, index) => ({
    x: leftPadding + xStep * index,
    y: topPadding + plotHeight - (point.value / maxValue) * plotHeight,
    label: point.label,
    value: point.value,
  }));

  const path = createLinePath(points);
  const areaPath = `${path} L ${points[points.length - 1].x} ${topPadding + plotHeight} L ${points[0].x} ${topPadding + plotHeight} Z`;
  const yTicks = 4;

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} className="w-full h-full overflow-visible">
      {Array.from({ length: yTicks + 1 }).map((_, index) => {
        const ratio = index / yTicks;
        const y = topPadding + plotHeight * ratio;
        const tickValue = Math.round(maxValue * (1 - ratio));

        return (
          <g key={index}>
            <line x1={leftPadding} x2={SVG_WIDTH - rightPadding} y1={y} y2={y} stroke="#27272a" strokeDasharray="4 4" />
            <text x={leftPadding} y={y - 6} fill="#71717a" fontSize="11">
              {formatCompactValue(tickValue)}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#line-chart-gradient)" opacity="0.22" />
      <path d={path} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((point, index) => (
        <g key={`${point.label}-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="4" fill="#f97316" />
          {(index % labelStep === 0 || index === points.length - 1) && (
            <text x={point.x} y={svgHeight - 10} fill="#a1a1aa" fontSize="11" textAnchor="middle">
              {point.label}
            </text>
          )}
        </g>
      ))}

      <defs>
        <linearGradient id="line-chart-gradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SimpleBarChart({ data, height = 260 }: BarChartProps) {
  if (data.length === 0) {
    return <div className={`${chartTextClass} flex h-full items-center justify-center`}>Aucune donnée</div>;
  }

  const topPadding = 24;
  const bottomPadding = 54;
  const leftPadding = 20;
  const rightPadding = 16;
  const svgHeight = height;
  const plotWidth = SVG_WIDTH - leftPadding - rightPadding;
  const plotHeight = svgHeight - topPadding - bottomPadding;
  const maxValue = clampMax(data.map((point) => point.value));
  const barGap = 18;
  const barWidth = Math.max((plotWidth - barGap * (data.length - 1)) / data.length, 20);

  return (
    <svg viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} className="w-full h-full overflow-visible">
      <line
        x1={leftPadding}
        x2={SVG_WIDTH - rightPadding}
        y1={topPadding + plotHeight}
        y2={topPadding + plotHeight}
        stroke="#27272a"
      />

      {data.map((point, index) => {
        const x = leftPadding + index * (barWidth + barGap);
        const barHeight = (point.value / maxValue) * plotHeight;
        const y = topPadding + plotHeight - barHeight;
        const label = point.label.length > 16 ? `${point.label.slice(0, 16)}...` : point.label;

        return (
          <g key={`${point.label}-${index}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="10" fill="#f97316" opacity="0.9" />
            <text x={x + barWidth / 2} y={y - 8} fill="#fafafa" fontSize="11" textAnchor="middle">
              {formatCompactValue(point.value)}
            </text>
            <text x={x + barWidth / 2} y={svgHeight - 28} fill="#a1a1aa" fontSize="11" textAnchor="middle">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export function SimpleDonutChart({
  data,
  colors,
  size = 240,
  strokeWidth = 28,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return <div className={`${chartTextClass} flex h-full items-center justify-center`}>Aucune donnée</div>;
  }

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  let currentAngle = 0;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-60 w-60 flex-shrink-0">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />

        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const path = angle >= 359.99
            ? null
            : describeArc(center, center, radius, currentAngle, currentAngle + angle);
          currentAngle += angle;

          return (
            path ? (
              <path
                key={`${item.label}-${index}`}
                d={path}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            ) : (
              <circle
                key={`${item.label}-${index}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
              />
            )
          );
        })}

        <text x={center} y={center - 4} textAnchor="middle" fill="#fafafa" fontSize="26" fontWeight="700">
          {total}
        </text>
        <text x={center} y={center + 18} textAnchor="middle" fill="#a1a1aa" fontSize="12">
          Total
        </text>
      </svg>

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(0);

          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm text-white">{item.label}</span>
                <span className="text-xs text-zinc-500">
                  {item.value} ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
