import type { ReactNode } from 'react';

export default function OrganizerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-amber-50/40 min-h-full">
            <div className="border-b border-amber-200 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-sm text-amber-400/80">
                    <span className="font-semibold tracking-wide uppercase text-xs">Organizer Portal</span>
                    <span className="text-slate-600">—</span>
                    <span className="text-slate-400 text-xs">Manage events, review applications and track your business performance</span>
                </div>
            </div>
            {children}
        </div>
    );
}
