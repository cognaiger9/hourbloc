'use client';

interface FocusFooterProps {
  onLogClick: () => void;
}

export default function FocusFooter({ onLogClick }: FocusFooterProps) {
  return (
    <footer className="w-full pb-8">
      <div className="flex justify-center items-end gap-2">
        {/* Configure */}
        {/* <button className="group flex flex-col items-center gap-1.5 p-3 min-w-[80px] rounded-xl hover:bg-black/[0.03] transition-colors duration-200">
          <div className="p-1 text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
              <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
              <path d="M12 2v2"></path><path d="M12 22v-2"></path>
              <path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path>
              <path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path>
              <path d="M14 12h8"></path><path d="M2 12h2"></path>
              <path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path>
              <path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93"></path>
            </svg>
          </div>
          <span className="text-xs font-medium text-foreground">Configure</span>
        </button> */}

        {/* Log */}
        <button
          onClick={onLogClick}
          className="group flex flex-col items-center gap-1.5 p-3 min-w-[80px] rounded-xl hover:bg-black/[0.03] transition-colors duration-200"
        >
          <div className="p-1 text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <line x1="10" y1="9" x2="8" y2="9"></line>
            </svg>
          </div>
          <span className="text-xs font-medium text-foreground">Log</span>
        </button>

        {/* Plan */}
        {/* <button className="group flex flex-col items-center gap-1.5 p-3 min-w-[80px] rounded-xl hover:bg-black/[0.03] transition-colors duration-200">
          <div className="p-1 text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"></circle>
              <path d="M6 9v12"></path>
              <path d="m21 3-3-3 3-3"></path>
              <path d="M3 21h18"></path>
              <path d="M18 21v-8a2 2 0 0 0-2-2H6"></path>
            </svg>
          </div>
          <span className="text-xs font-medium text-foreground">Plan</span>
        </button> */}
      </div>
    </footer>
  );
}

