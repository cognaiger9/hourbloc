'use client';

import { Clock, CheckCircle2, Zap, Trophy, Sparkles } from 'lucide-react';
import StatCard from './StatCard';
import type { LifetimeData, StreaksData } from '../types';

interface StatsSectionProps {
  lifetimeData: LifetimeData;
  streaksData: StreaksData;
}

export default function StatsSection({ lifetimeData, streaksData }: StatsSectionProps) {
  return (
    <section className="bg-[#EEEDE8] rounded-3xl p-6 shadow-sm flex-[3] flex flex-col">
      {/* Header */}
      <div className="flex gap-2.5 mb-6">
        <Sparkles className="w-5 h-5 text-accent-green mt-0.5" strokeWidth={2} />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium tracking-tight">Stats</h2>
          <p className="text-sm font-normal text-foreground opacity-60">
            Your work achievements and streaks
          </p>
        </div>
      </div>

      {/* Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <StatCard
          icon={Clock}
          label="Total Work Time"
          value={lifetimeData.totalWorkTime}
          className="py-6"
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Blocks"
          value={lifetimeData.totalBlocks.toString()}
          className="py-6"
        />
        <StatCard
          icon={Zap}
          label="Current Streak"
          value={`${streaksData.currentStreak} days`}
          className="py-6"
        />
        <StatCard
          icon={Trophy}
          label="Best Streak"
          value={`${streaksData.bestStreak} days`}
          iconColor="text-[#EA9A00]"
          className="py-6"
        />
      </div>
    </section>
  );
}

