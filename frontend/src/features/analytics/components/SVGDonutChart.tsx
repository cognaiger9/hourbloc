'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SVGDonutChartProps {
  segments: Array<{ 
    color: string; 
    percentage: number;
    tag?: string;
    time?: string;
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      tag?: string;
      time?: string;
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    if (data.tag && data.time) {
      return (
        <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1.5 shadow-lg">
          <div className="font-semibold">{data.tag}</div>
          <div className="text-gray-300">{data.time}</div>
          <div className="text-gray-300">{data.percentage}%</div>
        </div>
      );
    }
  }
  return null;
};

export default function SVGDonutChart({
  segments,
  size = 224,
  className,
}: SVGDonutChartProps) {
  // Transform segments to Recharts format
  const data = segments.map((segment) => ({
    ...segment,
    value: segment.percentage,
  }));

  // Calculate radius for pie chart
  // ResponsiveContainer will scale the chart, so we calculate radius as a percentage
  // of the container size. Recharts expects numeric values that will scale proportionally.
  const padding = 8;
  const outerRadius = size / 2 - padding;

  return (
    <div 
      className={className} 
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

