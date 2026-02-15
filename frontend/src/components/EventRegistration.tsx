"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

interface EventRegistrationProps {
    eventId: string;
    capacity: number;
    acceptedCount: number;
}

export default function EventRegistration({ eventId, capacity, acceptedCount }: EventRegistrationProps) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userApplication, setUserApplication] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFull = capacity > 0 && acceptedCount >= capacity;

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        // If logged in, check if user has already applied
        if (token) {
            checkUserApplication(token);
        }
    }, [eventId]);

    const checkUserApplication = async (token: string) => {
        try {
            const res = await fetch(getApiUrl('/applications/me'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const applications = await res.json();
                const existingApp = applications.find((app: any) => app.eventId === eventId);
                if (existingApp) {
                    setUserApplication(existingApp);
                }
            }
        } catch (err) {
            console.error('Error checking user application:', err);
        }
    };

    const handleApply = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(getApiUrl(`/applications/${eventId}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                const application = await res.json();
                setUserApplication(application);
                // Refresh the page to update the accepted count
                router.refresh();
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Failed to apply');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error applying to event:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase tracking-wider">
                        Accepted
                    </span>
                );
            case 'waitlisted':
                return (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 ring-1 ring-inset ring-yellow-600/20 uppercase tracking-wider">
                        Waitlisted
                    </span>
                );
            case 'applied':
                return (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-wider">
                        Pending Review
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Registration</h3>

            <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium">Status</span>
                    {userApplication ? (
                        getStatusBadge(userApplication.status)
                    ) : isFull ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10 uppercase tracking-wider">
                            Fully Booked
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase tracking-wider">
                            Open
                        </span>
                    )}
                </div>
                <div className="px-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Total Capacity</span>
                        <span className="font-bold text-slate-900">{capacity} seats</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Attending</span>
                        <span className="font-bold text-slate-900">{acceptedCount || 0} dancers</span>
                    </div>
                </div>
                {/* Progress bar */}
                {capacity > 0 && (
                    <div className="space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(((acceptedCount || 0) / capacity) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {Math.round(((acceptedCount || 0) / capacity) * 100)}% Full
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {userApplication ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-sm text-center text-slate-700 leading-normal font-medium">
                        You have applied to this event. The organizer will review your application.
                    </p>
                </div>
            ) : isLoggedIn ? (
                <button
                    onClick={handleApply}
                    disabled={isLoading}
                    className={`w-full rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                        isLoading
                            ? 'bg-slate-400 cursor-wait'
                            : 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/30'
                    }`}
                >
                    {isLoading ? 'Applying...' : isFull ? 'Join the Waitlist' : 'Apply to Participate'}
                </button>
            ) : (
                <>
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/30"
                    >
                        Log In to Apply
                    </button>
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-[11px] text-center text-slate-500 leading-normal">
                            Registration requires a verified dancer profile.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
