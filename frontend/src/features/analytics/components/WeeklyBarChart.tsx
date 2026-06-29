'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { formatMinutes, formatFullDate } from '@/utils/dateUtils';
import type { DayData } from '../types';

interface WeeklyBarChartProps {
  days: DayData[];
  maxHours?: number; // Maximum hours for scaling (default 6)
  className?: string;
}

// Transform data for Recharts
const transformDataForRecharts = (days: DayData[]) => {
  // Get all unique tags across all days
  const allTags = new Set<string>();
  days.forEach((day) => {
    day.tags?.forEach((tag) => allTags.add(tag.tag));
  });
  const uniqueTags = Array.from(allTags);

  // Create a map of tag to color (use first occurrence)
  const tagColorMap = new Map<string, string>();
  days.forEach((day) => {
    day.tags?.forEach((tag) => {
      if (!tagColorMap.has(tag.tag)) {
        tagColorMap.set(tag.tag, tag.color);
      }
    });
  });

  // Transform data
  return days.map((day) => {
    const dataPoint: Record<string, unknown> = {
      dayName: day.dayName,
      date: day.date,
      fullDate: day.fullDate,
      workTime: day.workTime,
      workTimeMinutes: day.workTimeMinutes,
      total: day.workTimeMinutes,
    };

    // Add each tag as a property
    uniqueTags.forEach((tagName) => {
      const tagData = day.tags?.find((t) => t.tag === tagName);
      dataPoint[tagName] = tagData?.minutes || 0;
    });

    return dataPoint;
  });
};

// Custom tooltip component
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    payload: {
      fullDate?: Date;
      workTime: string;
      workTimeMinutes: number;
      [key: string]: unknown;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  if (!data.fullDate) return null;

  // Get all tags with non-zero values
  const tagsWithData = payload
    .filter((p) => p.value > 0)
    .map((p) => ({
      tag: p.dataKey,
      minutes: p.value,
      color: p.color,
    }));

  if (tagsWithData.length === 0) return null;

  return (
    <div className="bg-[#1b1b1b] text-white rounded-lg p-4 shadow-lg min-w-[200px]">
      <div className="text-primary font-semibold mb-3 pb-2 border-b border-white/20">
        {formatFullDate(data.fullDate)}
      </div>
      <div className="flex flex-col gap-2">
        {tagsWithData.map((tag, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <span className="text-primary font-normal">
              {tag.tag} {formatMinutes(tag.minutes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom label component to show total time above bars
interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  index?: number;
  payload?: {
    workTime: string;
    workTimeMinutes: number;
  };
}

const CustomLabel = (props: any) => {
  const { x, y, width, value, index } = props;

  if (x === undefined || y === undefined || width === undefined || !value) return null;

  return (
    <g>
      {/* Background for better visibility */}
      <rect
        x={x + width / 2 - 28}
        y={y - 24}
        width={56}
        height={22}
        fill="#EEEDE8"
        fillOpacity={0.95}
        rx={4}
      />
      {/* Text */}
      <text
        x={x + width / 2}
        y={y - 9}
        fill="#1b1b1b"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  );
};

export default function WeeklyBarChart({
  days,
  maxHours,
  className,
}: WeeklyBarChartProps) {
  const chartData = transformDataForRecharts(days);

  // Calculate dynamic max hours based on actual data
  const calculateMaxHours = () => {
    if (maxHours !== undefined) return maxHours; // Use provided maxHours if specified

    // Find the maximum workTimeMinutes across all days
    const maxMinutesInData = Math.max(...days.map(d => d.workTimeMinutes || 0));
    const maxHoursInData = maxMinutesInData / 60;

    // Round up to the nearest 2-hour interval, with a minimum of 4 hours
    const roundedMax = Math.ceil(maxHoursInData / 2) * 2;
    return Math.max(roundedMax, 4);
  };

  const dynamicMaxHours = calculateMaxHours();
  const maxMinutes = dynamicMaxHours * 60;

  // Generate dynamic Y-axis ticks
  const generateYAxisTicks = () => {
    const tickCount = 4; // Show 4 ticks (including 0)
    const interval = dynamicMaxHours / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => {
      const hours = Math.ceil(i * interval);
      return hours * 60; // Convert to minutes
    });
  };

  const yAxisTicks = generateYAxisTicks();

  // Get all unique tags
  const allTags = new Set<string>();
  days.forEach((day) => {
    day.tags?.forEach((tag) => allTags.add(tag.tag));
  });
  const uniqueTags = Array.from(allTags);

  // Create tag color map
  const tagColorMap = new Map<string, string>();
  days.forEach((day) => {
    day.tags?.forEach((tag) => {
      if (!tagColorMap.has(tag.tag)) {
        tagColorMap.set(tag.tag, tag.color);
      }
    });
  });

  return (
    <div
      className={`relative bg-[#EEEDE8] rounded-2xl p-2 border border-[#E4E2DD]/50 shadow-sm ${className}`}
      style={{ height: '380px' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 50, right: 10, bottom: 50, left: 40 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="0"
            stroke="#E4E2DD"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="dayName"
            axisLine={false}
            tickLine={false}
            height={60}
            tick={(props: { x?: number; y?: number; payload?: { value: string; payload: Record<string, unknown> } }) => {
              const { x, y, payload } = props;
              if (!x || !y || !payload) return null;
              const date = payload.payload?.date as string;
              return (
                <g>
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    fill="#1b1b1b"
                    fontSize={16}
                    fontWeight={500}
                  >
                    {payload.value}
                  </text>
                  {date && (
                    <text
                      x={x}
                      y={y + 36}
                      textAnchor="middle"
                      fill="#6d6d6d"
                      fontSize={12}
                    >
                      {date}
                    </text>
                  )}
                </g>
              );
            }}
          />
          <YAxis
            domain={[0, maxMinutes]}
            tickFormatter={(value) => {
              const hours = value / 60;
              return hours === 0 ? '0m' : `${hours}h`;
            }}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6d6d6d', fontSize: 12 }}
            width={32}
            ticks={yAxisTicks}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Render stacked bars for each tag */}
          {uniqueTags.map((tagName, index) => {
            const tagColor = tagColorMap.get(tagName) || '#3CBF6F';
            const isLastTag = index === uniqueTags.length - 1;
            return (
              <Bar
                key={tagName}
                dataKey={tagName}
                stackId="a"
                radius={0}
              >
                {chartData.map((entry, entryIndex) => {
                  // For empty days, show grey bar on the first bar only
                  if (entry.workTimeMinutes === 0 && index === 0) {
                    return (
                      <Cell
                        key={`cell-${entryIndex}`}
                        fill="#E4E2DD"
                        fillOpacity={0.3}
                      />
                    );
                  }
                  // For days with data, use the tag color
                  return (
                    <Cell
                      key={`cell-${entryIndex}`}
                      fill={tagColor}
                    />
                  );
                })}
                {isLastTag && (
                  <LabelList
                    dataKey="workTime"
                    position="top"
                    content={CustomLabel}
                  />
                )}
              </Bar>
            );
          })}

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

