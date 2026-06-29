'use client';

export default function Loading() {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-accent-green rounded-full animate-spin" />
        <p className="text-sm text-foreground-secondary">Loading...</p>
      </div>
    </div>
  );
}
