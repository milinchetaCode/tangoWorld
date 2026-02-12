"use client";

import { MOCK_EVENTS } from '@/lib/mock-data';
import { notFound, useRouter } from 'next/navigation';
import { useState, use } from 'react';
import { Check, X, Clock, ArrowLeft } from 'lucide-react';

// Mock participants data
const INITIAL_PARTICIPANTS = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', gender: 'female', status: 'applied', city: 'London' },
    { id: 'u2', name: 'Bob Jones', email: 'bob@example.com', gender: 'male', status: 'accepted', city: 'Paris' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', gender: 'male', status: 'waitlisted', city: 'Berlin' },
    { id: 'u4', name: 'Diana Prince', email: 'diana@example.com', gender: 'female', status: 'applied', city: 'New York' },
];

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const event = MOCK_EVENTS.find((e) => e.id === id);
    const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);

    if (!event) {
        notFound();
    }

    const handleStatusChange = (userId: string, newStatus: string) => {
        setParticipants(prev => prev.map(p =>
            p.id === userId ? { ...p, status: newStatus } : p
        ));
        console.log(`Changed user ${userId} status to ${newStatus}`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Accepted</span>;
            case 'waitlisted': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Waitlisted</span>;
            case 'rejected': return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rejected</span>;
            default: return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Applied</span>;
        }
    };

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
                            Capacity: {event.acceptedCount} / {event.capacity}
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
                    <ul role="list" className="divide-y divide-slate-100">
                        {participants.map((person) => (
                            <li key={person.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap px-4 sm:px-6 hover:bg-slate-50">
                                <div>
                                    <p className="text-sm font-semibold leading-6 text-slate-900">
                                        {person.name} <span className="text-slate-400 font-normal">({person.gender})</span>
                                    </p>
                                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                                        <p>{person.email}</p>
                                        <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                        <p>{person.city}</p>
                                    </div>
                                </div>
                                <div className="flex w-full flex-none gap-x-4 sm:w-auto items-center">
                                    {getStatusBadge(person.status)}

                                    <div className="flex gap-2 ml-4">
                                        {person.status !== 'accepted' && (
                                            <button
                                                onClick={() => handleStatusChange(person.id, 'accepted')}
                                                className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                title="Accept"
                                            >
                                                <Check className="h-4 w-4 text-green-600" />
                                            </button>
                                        )}
                                        {person.status !== 'waitlisted' && (
                                            <button
                                                onClick={() => handleStatusChange(person.id, 'waitlisted')}
                                                className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                                title="Waitlist"
                                            >
                                                <Clock className="h-4 w-4 text-yellow-600" />
                                            </button>
                                        )}
                                        {person.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleStatusChange(person.id, 'rejected')}
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
                </div>
            </div>
        </div>
    );
}
