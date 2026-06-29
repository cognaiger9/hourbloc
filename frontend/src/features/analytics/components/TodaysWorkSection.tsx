'use client';

import { Clock, Layers } from 'lucide-react';
import StatCard from './StatCard';
import type { TodayData } from '../types';

interface TodaysWorkSectionProps {
  data: TodayData;
}

export default function TodaysWorkSection({ data }: TodaysWorkSectionProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="bg-[#EEEDE8] rounded-3xl p-6 shadow-sm flex-[2] flex flex-col">
      {/* Header */}
      <div className="flex gap-2.5 mb-6">
        <Clock className="w-5 h-5 text-accent-green mt-0.5" strokeWidth={2} />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium tracking-tight">Today&apos;s Work</h2>
          <p className="text-sm font-normal text-foreground opacity-60">
            {formatDate(data.date)}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex gap-3 mt-auto">
        <StatCard
          icon={Clock}
          label="Work Time"
          value={data.workTime}
          className="flex-1 py-6"
        />
        <StatCard
          icon={Layers}
          label="Blocks"
          value={data.blocks.toString()}
          className="flex-1 py-6"
        />
      </div>
    </section>
  );
}

