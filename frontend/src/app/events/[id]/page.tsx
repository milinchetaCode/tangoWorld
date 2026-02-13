import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, Info } from 'lucide-react';

import { getApiUrl } from '@/lib/api';

async function getEvent(id: string) {
    try {
        const res = await fetch(getApiUrl(`/events/${id}`), { next: { revalidate: 0 } });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch event');
        }
        return res.json();
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const isFull = (event.capacity ?? 0) > 0 && (event.acceptedCount ?? 0) >= (event.capacity ?? 0);

    const formattedDate = event.startDate && event.endDate
        ? `${new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
        : 'Date not set';

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Image */}
            <div className="relative h-[450px] w-full bg-slate-900 overflow-hidden">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover opacity-70"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto z-10">
                    <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-all group">
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to all events
                    </Link>
                    <h1 className="text-5xl font-extrabold text-white sm:text-6xl tracking-tight leading-tight">{event.title}</h1>
                    <div className="mt-6 flex flex-wrap gap-8 text-white/90">
                        <div className="flex items-center text-lg font-medium">
                            <Calendar className="mr-3 h-6 w-6 text-rose-500" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center text-lg font-medium">
                            <MapPin className="mr-3 h-6 w-6 text-rose-500" />
                            {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            <Info className="mr-3 h-6 w-6 text-rose-500" />
                            About the Event
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
                            <p>
                                Join us for {event.title} at <strong>{event.venue || 'the venue'}</strong>.
                                This event is a unique opportunity to immerse yourself in the world of tango.
                            </p>
                            {event.schedule && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                        <Clock className="mr-2 h-5 w-5 text-rose-500" />
                                        Schedule
                                    </h3>
                                    <p>{event.schedule}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {(event.guests || event.djs) && (
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                                <Users className="mr-3 h-6 w-6 text-rose-500" />
                                Lineup
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {event.guests && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">Guests & Teachers</h3>
                                        <p className="text-slate-600 leading-relaxed">{event.guests}</p>
                                    </div>
                                )}
                                {event.djs && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">DJs</h3>
                                        <p className="text-slate-600 leading-relaxed">{event.djs}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Registration</h3>

                        <div className="space-y-5 mb-8">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-slate-500 font-medium">Status</span>
                                {isFull ? (
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
                                    <span className="font-bold text-slate-900">{event.capacity} seats</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-sm">Attending</span>
                                    <span className="font-bold text-slate-900">{event.acceptedCount || 0} dancers</span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            {event.capacity && (
                                <div className="space-y-2">
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-rose-500'}`}
                                            style={{ width: `${Math.min(((event.acceptedCount || 0) / event.capacity) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {Math.round(((event.acceptedCount || 0) / event.capacity) * 100)}% Full
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isFull}
                            className={`w-full rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isFull
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/30'
                                }`}
                        >
                            {isFull ? 'Join the Waitlist' : 'Apply to Participate'}
                        </button>

                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[11px] text-center text-slate-500 leading-normal">
                                Registration requires a verified dancer profile. Please <Link href="/login" className="text-rose-600 font-bold hover:underline">Log In</Link> to proceed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
