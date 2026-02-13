"use client";

import Link from 'next/link';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user', e);
            }
        }

        // Listen for storage changes (optional but good for multi-tab consistency)
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            setUser(updatedUser ? JSON.parse(updatedUser) : null);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

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
                        {user && (
                            <Link href="/my-outings" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                                My Outings
                            </Link>
                        )}
                        {user?.organizerStatus === 'approved' && (
                            <Link href="/organizer" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors">
                                Organizer
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/profile" className="flex items-center text-slate-700 hover:text-rose-600 transition-colors font-medium">
                                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center mr-2 ring-2 ring-white shadow-sm">
                                        <UserIcon className="h-4 w-4 text-rose-600" />
                                    </div>
                                    <span>{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-base font-medium transition-colors">
                                Sign In
                            </Link>
                        )}
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
                        {user && (
                            <Link href="/my-outings" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                                My Outings
                            </Link>
                        )}
                        {user?.organizerStatus === 'approved' && (
                            <Link href="/organizer" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                                Organizer
                            </Link>
                        )}

                        {user ? (
                            <>
                                <Link href="/profile" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                                    Profile ({user.name})
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-300"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
