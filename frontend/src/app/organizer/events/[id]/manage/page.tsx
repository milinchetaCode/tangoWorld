"use client";

import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect, use, useCallback } from 'react';
import { Check, X, Clock, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Application, Event } from '@/types/application';

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEventAndApplications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch event details
            const eventRes = await fetch(getApiUrl(`/events/${id}`));
            if (!eventRes.ok) {
                throw new Error('Failed to fetch event');
            }
            const eventData = await eventRes.json();
            setEvent(eventData);

            // Fetch applications for this event
            const appsRes = await fetch(getApiUrl(`/applications/event/${id}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setApplications(appsData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load event data');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchEventAndApplications();
    }, [fetchEventAndApplications]);

    const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(getApiUrl(`/applications/${applicationId}/status`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Update local state
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                ));
            } else {
                console.error('Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Accepted</span>;
            case 'waitlisted': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Waitlisted</span>;
            case 'rejected': return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rejected</span>;
            default: return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Applied</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <p className="text-red-600">{error || 'Event not found'}</p>
            </div>
        );
    }

    const acceptedCount = applications.filter(app => app.status === 'accepted').length;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <button onClick={() => router.back()} className="flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Dashboard
                </button>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Manage: {event.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Capacity: {acceptedCount} / {event.capacity}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:px-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900">Participants</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Manage applications and attendance.</p>
                </div>
                <div className="border-t border-slate-100">
                    {applications.length === 0 ? (
                        <div className="px-4 py-8 sm:px-6 text-center text-slate-500">
                            No applications yet
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-slate-100">
                            {applications.map((application) => (
                                <li key={application.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap px-4 sm:px-6 hover:bg-slate-50">
                                    <div>
                                        <p className="text-sm font-semibold leading-6 text-slate-900">
                                            {application.user?.name} {application.user?.surname} <span className="text-slate-400 font-normal">({application.user?.gender})</span>
                                        </p>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                                            <p>{application.user?.email}</p>
                                            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                            <p>Applied: {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        {application.user?.dietaryNeeds && (
                                            <p className="mt-1 text-xs text-slate-500">Dietary needs: {application.user.dietaryNeeds}</p>
                                        )}
                                    </div>
                                    <div className="flex w-full flex-none gap-x-4 sm:w-auto items-center">
                                        {getStatusBadge(application.status)}

                                        <div className="flex gap-2 ml-4">
                                            {application.status !== 'accepted' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'accepted')}
                                                    className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                    title="Accept"
                                                >
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </button>
                                            )}
                                            {application.status !== 'waitlisted' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'waitlisted')}
                                                    className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                    title="Waitlist"
                                                >
                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                </button>
                                            )}
                                            {application.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                                    className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                    title="Reject"
                                                >
                                                    <X className="h-4 w-4 text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
