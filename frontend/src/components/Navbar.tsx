"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-slate-900 tracking-tight">Tango<span className="text-rose-600">World</span></span>
                        </Link>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link href="/" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                            Events
                        </Link>
                        <Link href="/my-outings" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                            My Outings
                        </Link>
                        <Link href="/organizer" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                            Organizer
                        </Link>
                        <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-base font-medium transition-colors">
                            Sign In
                        </Link>
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/" className="block pl-3 pr-4 py-2 border-l-4 border-rose-500 text-base font-medium text-rose-700 bg-rose-50">
                            Events
                        </Link>
                        <Link href="/my-outings" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                            My Outings
                        </Link>
                        <Link href="/organizer" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                            Organizer
                        </Link>
                        <Link href="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
