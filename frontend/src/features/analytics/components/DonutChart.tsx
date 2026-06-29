interface DonutChartProps {
  segments: Array<{ color: string; percentage: number }>;
  size?: number;
  innerSize?: number;
  className?: string;
}

export default function DonutChart({
  segments,
  size = 220,
  innerSize = 140,
  className,
}: DonutChartProps) {
  // Calculate conic gradient stops
  let currentPercentage = 0;
  const gradientStops = segments
    .map((segment) => {
      const start = currentPercentage;
      const end = currentPercentage + segment.percentage;
      currentPercentage = end;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientStops})`,
          position: 'relative',
        }}
      >
        <div
          className="absolute rounded-full bg-[#EEEDE8]"
          style={{
            width: innerSize,
            height: innerSize,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}

