import { MOCK_EVENTS } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle } from 'lucide-react';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = MOCK_EVENTS.find((e) => e.id === id);

    if (!event) {
        notFound();
    }

    const isFull = (event.capacity ?? 0) > 0 && (event.acceptedCount ?? 0) >= (event.capacity ?? 0);

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Hero Image */}
            <div className="relative h-96 w-full bg-slate-900">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover opacity-60"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Events
                    </Link>
                    <h1 className="text-4xl font-bold text-white sm:text-5xl">{event.title}</h1>
                    <div className="mt-4 flex flex-wrap gap-6 text-slate-200">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-rose-500" />
                            {event.date}
                        </div>
                        <div className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-rose-500" />
                            {event.location}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About the Event</h2>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p>
                                Join us for an unforgettable experience at the {event.title}.
                                This event brings together tango enthusiasts from all over the world.
                            </p>
                            <p className="mt-4">
                                (This is a placeholder description. In the real app, this would come from the database.)
                            </p>
                        </div>
                    </section>

                    <section className="border-t border-slate-200 pt-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Lineup (Guests/DJs)</h2>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <p className="text-slate-500 italic">No guests listed yet.</p>
                        </div>
                    </section>
                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Registration</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Status</span>
                                {isFull ? (
                                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                        Fully Booked
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        Open
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Capacity</span>
                                <span className="font-medium text-slate-900">{event.capacity} guests</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Attending</span>
                                <span className="font-medium text-slate-900">{event.acceptedCount} confirmed</span>
                            </div>
                            {/* Progress bar */}
                            {event.capacity && event.acceptedCount && (
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-rose-500'}`}
                                        style={{ width: `${Math.min((event.acceptedCount / event.capacity) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isFull}
                            className={`w-full rounded-full px-4 py-3 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isFull
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600'
                                }`}
                        >
                            {isFull ? 'Join Waitlist' : 'Apply Now'}
                        </button>

                        <p className="mt-4 text-xs text-center text-slate-400">
                            You need to be logged in to apply.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
