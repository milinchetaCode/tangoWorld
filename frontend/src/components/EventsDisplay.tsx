'use client';

import { useState, useMemo, useCallback } from 'react';
import { List, Map, Search, X, Calendar, SlidersHorizontal, Navigation, Loader2 } from 'lucide-react';
import Fuse from 'fuse.js';
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
  venue?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  date?: string;
  imageUrl?: string;
  capacity?: number;
  acceptedCount?: number;
  applications?: { id: string; status: string }[];
}

interface EventsDisplayProps {
  events: Event[];
}

// Haversine formula to compute distance (km) between two lat/lng points
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Normalize raw event: derive acceptedCount from applications array if not present
function normalize(event: Event): Event {
  const acceptedCount =
    event.acceptedCount ??
    (event.applications?.filter((a) => a.status === 'accepted').length ?? 0);
  return { ...event, acceptedCount };
}

export default function EventsDisplay({ events: rawEvents }: EventsDisplayProps) {
  const events = useMemo(() => rawEvents.map(normalize), [rawEvents]);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const NEAR_ME_RADIUS_KM = 100;

  // Fuse.js instance (re-created only when events change)
  const fuse = useMemo(
    () =>
      new Fuse(events, {
        keys: ['title', 'location', 'venue'],
        threshold: 0.4,
        includeScore: true,
      }),
    [events],
  );

  // Activate / deactivate "near me"
  const handleNearMe = useCallback(() => {
    if (nearMeActive) {
      setNearMeActive(false);
      setUserLocation(null);
      setGeoError('');
      return;
    }
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMeActive(true);
        setGeoLoading(false);
      },
      () => {
        setGeoError('Unable to retrieve your location. Please allow location access.');
        setGeoLoading(false);
      },
    );
  }, [nearMeActive]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
    setAvailableOnly(false);
    setNearMeActive(false);
    setUserLocation(null);
    setGeoError('');
  }, []);

  const hasActiveFilters = searchQuery || dateFrom || dateTo || availableOnly || nearMeActive;

  const filteredEvents = useMemo(() => {
    let result = events;

    // 1. Fuzzy search
    if (searchQuery.trim()) {
      result = fuse.search(searchQuery.trim()).map((r) => r.item);
    }

    // 2. Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((e) => {
        const d = e.startDate ? new Date(e.startDate) : null;
        return d && d >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      // Include the entire day of dateTo
      to.setHours(23, 59, 59, 999);
      result = result.filter((e) => {
        const d = e.startDate ? new Date(e.startDate) : null;
        return d && d <= to;
      });
    }

    // 3. Available only (events with no capacity set are treated as unlimited/always available)
    if (availableOnly) {
      result = result.filter((e) => {
        if (!e.capacity) return true; // no capacity limit → always available
        return (e.acceptedCount ?? 0) < e.capacity;
      });
    }

    // 4. Near me (100 km radius)
    if (nearMeActive && userLocation) {
      result = result.filter((e) => {
        if (!e.latitude || !e.longitude) return false;
        return (
          haversineKm(userLocation.lat, userLocation.lng, e.latitude, e.longitude) <=
          NEAR_ME_RADIUS_KM
        );
      });
    }

    return result;
  }, [events, fuse, searchQuery, dateFrom, dateTo, availableOnly, nearMeActive, userLocation]);

  const activeFilterCount = [
    !!searchQuery,
    !!dateFrom || !!dateTo,
    availableOnly,
    nearMeActive,
  ].filter(Boolean).length;

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Upcoming Events
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            Handpicked tango events from around the world.
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-8 space-y-4">

          {/* Row 1: Search + filter toggle + view toggle */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

            {/* Fuzzy Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, cities, venues…"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="inline-flex rounded-xl bg-slate-200 p-1 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>

          {/* Row 2: Advanced filters (collapsible) */}
          {filtersOpen && (
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 border-t border-slate-200">

              {/* Date From */}
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1 min-w-[160px]">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom ? dateFrom : undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              {/* Available Only toggle */}
              <div className="flex items-end">
                <button
                  onClick={() => setAvailableOnly((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    availableOnly
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      availableOnly ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}
                  >
                    {availableOnly && (
                      <svg viewBox="0 0 10 8" fill="none" className="h-2.5 w-2.5">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  Available spots only
                </button>
              </div>

              {/* Near Me */}
              <div className="flex items-end">
                <button
                  onClick={handleNearMe}
                  disabled={geoLoading}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                    nearMeActive
                      ? 'border-sky-300 bg-sky-50 text-sky-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  Near me ({NEAR_ME_RADIUS_KM} km)
                  {nearMeActive && <X className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Clear all filters */}
              {hasActiveFilters && (
                <div className="flex items-end sm:ml-auto">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-slate-500 underline hover:text-rose-600 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Geo error */}
          {geoError && (
            <p className="text-sm text-red-600">{geoError}</p>
          )}
        </div>

        {/* ── Results summary ── */}
        <p className="text-sm text-slate-500 mb-6">
          {hasActiveFilters
            ? `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} match your filters`
            : `${filteredEvents.length} upcoming event${filteredEvents.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── Content ── */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Search className="mx-auto h-10 w-10 text-slate-300 mb-4" />
                <p className="text-slate-500 italic">No events match your current filters.</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 text-sm font-medium text-rose-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <EventMap events={filteredEvents} />
        )}
      </div>
    </section>
  );
}
