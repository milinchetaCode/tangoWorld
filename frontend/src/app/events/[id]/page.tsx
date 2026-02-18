import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, Info } from 'lucide-react';

import { getApiUrl } from '@/lib/api';
import EventRegistration from '@/components/EventRegistration';

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

                <div className="absolute bottom-0 left-0 right-0 px-8 pt-8 pb-16 max-w-7xl mx-auto z-10">
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
                    <section className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200">
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
                        <section className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200">
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
                    <EventRegistration 
                        eventId={event.id}
                        capacity={event.capacity}
                        acceptedCount={event.acceptedCount || 0}
                        startDate={event.startDate}
                        endDate={event.endDate}
                        isPublished={event.isPublished}
                        priceFullEventNoFoodNoAccommodation={event.priceFullEventNoFoodNoAccommodation ? Number(event.priceFullEventNoFoodNoAccommodation) : undefined}
                        priceFullEventFood={event.priceFullEventFood ? Number(event.priceFullEventFood) : undefined}
                        priceFullEventAccommodation={event.priceFullEventAccommodation ? Number(event.priceFullEventAccommodation) : undefined}
                        priceFullEventBoth={event.priceFullEventBoth ? Number(event.priceFullEventBoth) : undefined}
                        priceDailyFood={event.priceDailyFood ? Number(event.priceDailyFood) : undefined}
                        priceDailyNoFood={event.priceDailyNoFood ? Number(event.priceDailyNoFood) : undefined}
                    />
                </div>
            </div>
        </div>
    );
}
