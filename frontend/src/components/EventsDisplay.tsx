'use client';

import { useState } from 'react';
import { List, Map } from 'lucide-react';
import EventCard from './EventCard';
import dynamic from 'next/dynamic';

// Dynamically import EventMap to avoid SSR issues with Leaflet
const EventMap = dynamic(() => import('./EventMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-lg bg-slate-100 flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

interface Event {
  id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  date?: string;
  imageUrl?: string;
  capacity?: number;
  acceptedCount?: number;
}

interface EventsDisplayProps {
  events: Event[];
  searchQuery?: string;
}

export default function EventsDisplay({ events, searchQuery }: EventsDisplayProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {searchQuery ? 'Search Results' : 'Upcoming Events'}
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            {searchQuery
              ? `Found ${events.length} event${events.length !== 1 ? 's' : ''} matching "${searchQuery}"`
              : 'Handpicked tango events from around the world.'}
          </p>

          {/* View Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="h-4 w-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="h-4 w-4" />
                Map View
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-16">
          {viewMode === 'list' ? (
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500 italic">No upcoming events found at the moment.</p>
                </div>
              )}
            </div>
          ) : (
            <EventMap events={events} />
          )}
        </div>
      </div>
    </section>
  );
}
