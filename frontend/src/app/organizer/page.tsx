import { MOCK_EVENTS } from '@/lib/mock-data';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';

export default function OrganizerDashboard() {
    // In a real app, we would fetch events created by the logged-in user
    const myEvents = MOCK_EVENTS.slice(0, 2);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Organizer Dashboard
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link
                        href="/organizer/events/new"
                        className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                    >
                        <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                        Create Event
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Your Events</h3>

                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {myEvents.map((event) => (
                        <div key={event.id} className="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <div className="flex h-full flex-col p-6">
                                <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                                <div className="mt-2 text-sm text-slate-500">
                                    <div className="flex items-center mt-1">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {event.date}
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.location}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-1 flex-col justify-end">
                                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                        <div className="flex items-center">
                                            <Users className="mr-1.5 h-4 w-4" />
                                            {event.acceptedCount} / {event.capacity}
                                        </div>
                                        <span>{(event.acceptedCount! / event.capacity!) * 100}% Full</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/organizer/events/${event.id}/manage`}
                                            className="flex justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                                        >
                                            Manage
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State placeholder if needed */}
                    {myEvents.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <Calendar className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-semibold text-slate-900">No events</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by creating a new event.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
