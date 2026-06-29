'use client';

import { cn } from '@/utils/common';
import { TabType } from '../types';

interface BacklogTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function BacklogTabs({ activeTab, onTabChange }: BacklogTabsProps) {
  return (
    <div className="px-6 sm:px-12 mb-4">
      <div className="inline-flex bg-[#EEEDE8] p-1 rounded-lg border border-[#E4E2DD]/60">
        <button
          onClick={() => onTabChange('active')}
          className={cn(
            'relative px-3.5 py-1 min-w-[72px] h-[30px] rounded-md flex items-center justify-center transition-all duration-200',
            activeTab === 'active'
              ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.02)] z-10'
              : 'text-[#6D6D6D] hover:text-[#1B1B1B] hover:bg-white/50'
          )}
        >
          <span className={cn(
            'text-sm font-medium leading-5',
            activeTab === 'active' ? 'text-[#1B1B1B]' : ''
          )}>Active</span>
        </button>
        <button
          onClick={() => onTabChange('completed')}
          className={cn(
            'px-3.5 py-1 min-w-[72px] h-[30px] rounded-md flex items-center justify-center transition-all duration-200',
            activeTab === 'completed'
              ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.02)] z-10'
              : 'text-[#6D6D6D] hover:text-[#1B1B1B] hover:bg-white/50'
          )}
        >
          <span className={cn(
            'text-sm font-medium leading-5',
            activeTab === 'completed' ? 'text-[#1B1B1B]' : ''
          )}>Completed</span>
        </button>
      </div>
    </div>
  );
}
