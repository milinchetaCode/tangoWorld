"use client";

import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function MyOutingsPage() {
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Mock user outings
    const myOutings = [
        { eventId: '1', status: 'accepted', appliedDate: '2026-01-15' },
        { eventId: '2', status: 'waitlisted', appliedDate: '2026-01-20' },
        { eventId: '3', status: 'applied', appliedDate: '2026-02-01' },
    ];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'accepted':
                return {
                    color: 'bg-green-50 text-green-700 ring-green-600/20',
                    icon: CheckCircle,
                    label: 'Accepted'
                };
            case 'waitlisted':
                return {
                    color: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
                    icon: Clock,
                    label: 'Waitlisted'
                };
            case 'rejected':
                return {
                    color: 'bg-red-50 text-red-700 ring-red-600/10',
                    icon: XCircle,
                    label: 'Rejected'
                };
            default:
                return {
                    color: 'bg-blue-50 text-blue-700 ring-blue-700/10',
                    icon: AlertCircle,
                    label: 'Applied'
                };
        }
    };

    const calculateDaysUntil = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredOutings = activeFilter === 'all'
        ? myOutings
        : myOutings.filter(o => o.status === activeFilter);

    const filters = [
        { id: 'all', label: 'All Events', count: myOutings.length },
        { id: 'accepted', label: 'Accepted', count: myOutings.filter(o => o.status === 'accepted').length },
        { id: 'waitlisted', label: 'Waitlisted', count: myOutings.filter(o => o.status === 'waitlisted').length },
        { id: 'applied', label: 'Applied', count: myOutings.filter(o => o.status === 'applied').length },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                    My Outings
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Track your event applications and registrations
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`
                                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                    ${activeFilter === filter.id
                                        ? 'border-rose-500 text-rose-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }
                                `}
                            >
                                {filter.label}
                                <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${activeFilter === filter.id
                                        ? 'bg-rose-100 text-rose-600'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {filter.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Events Grid */}
            {filteredOutings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {filteredOutings.map((outing) => {
                        const event = MOCK_EVENTS.find(e => e.id === outing.eventId);
                        if (!event) return null;

                        const statusConfig = getStatusConfig(outing.status);
                        const StatusIcon = statusConfig.icon;
                        const daysUntil = calculateDaysUntil(event.date);
                        const isPast = daysUntil < 0;
                        const isSoon = daysUntil >= 0 && daysUntil <= 7;

                        return (
                            <Link
                                key={outing.eventId}
                                href={`/events/${event.id}`}
                                className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                            >
                                {/* Event Image */}
                                <div className="aspect-[16/9] bg-slate-100 overflow-hidden relative">
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                            <Calendar className="h-16 w-16 text-slate-300" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusConfig.color} backdrop-blur-sm`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {statusConfig.label}
                                        </div>
                                    </div>

                                    {/* Countdown Badge */}
                                    {!isPast && isSoon && (
                                        <div className="absolute top-3 left-3">
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                                <Clock className="h-3.5 w-3.5" />
                                                {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                                            </div>
                                        </div>
                                    )}

                                    {isPast && (
                                        <div className="absolute top-3 left-3">
                                            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                                                Past Event
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Event Details */}
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                                        {event.title}
                                    </h3>

                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center text-sm text-slate-600">
                                            <Calendar className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{event.date}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-slate-600">
                                            <MapPin className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>

                                        <div className="flex items-center text-sm text-slate-600">
                                            <Users className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span>
                                                {event.acceptedCount} / {event.capacity} attendees
                                                {event.acceptedCount && event.capacity && (
                                                    <span className="ml-2 text-xs text-slate-500">
                                                        ({Math.round((event.acceptedCount / event.capacity) * 100)}% full)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Application Date */}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-xs text-slate-500">
                                            Applied on {new Date(outing.appliedDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">No events found</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {activeFilter === 'all'
                            ? "You haven't applied to any events yet."
                            : `You don't have any ${activeFilter} events.`
                        }
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
                        >
                            Discover Events
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
