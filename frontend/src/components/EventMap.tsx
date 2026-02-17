'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet
const iconPrototype = L.Icon.Default.prototype as L.Icon & {
  _getIconUrl?: string;
};
delete iconPrototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Event {
  id: string;
  title: string;
  location: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
}

interface EventMapProps {
  events: Event[];
}

export default function EventMap({ events }: EventMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Filter events with coordinates
    const eventsWithCoords = events.filter(e => e.latitude && e.longitude);

    if (eventsWithCoords.length === 0) {
      return;
    }

    // Initialize map
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([48.8566, 2.3522], 5); // Default to Europe

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for events
    const bounds = L.latLngBounds([]);
    eventsWithCoords.forEach((event) => {
      const lat = event.latitude!;
      const lng = event.longitude!;
      
      const marker = L.marker([lat, lng]).addTo(map);
      
      const formattedDate = event.startDate && event.endDate
        ? `${new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : '';

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${event.title}</h3>
          <p style="margin: 4px 0; font-size: 14px;">📍 ${event.location}</p>
          ${formattedDate ? `<p style="margin: 4px 0; font-size: 14px;">📅 ${formattedDate}</p>` : ''}
          <a href="/events/${event.id}" style="display: inline-block; margin-top: 8px; color: #e11d48; text-decoration: underline; font-size: 14px;">View Details</a>
        </div>
      `);

      bounds.extend([lat, lng]);
    });

    // Fit bounds to show all markers
    if (eventsWithCoords.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [events]);

  // Filter events with coordinates
  const eventsWithCoords = events.filter(e => e.latitude && e.longitude);
  const eventsWithoutCoords = events.length - eventsWithCoords.length;

  return (
    <div className="space-y-4">
      {eventsWithoutCoords > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {eventsWithoutCoords} event{eventsWithoutCoords !== 1 ? 's' : ''} {eventsWithoutCoords !== 1 ? 'are' : 'is'} not shown on the map because {eventsWithoutCoords !== 1 ? 'they don\'t' : 'it doesn\'t'} have location coordinates yet.
            </span>
          </p>
        </div>
      )}
      
      {eventsWithCoords.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No events with location coordinates available yet.</p>
          <p className="text-sm text-slate-500 mt-2">Map view will be available once events have coordinates.</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-[600px] rounded-lg shadow-lg border border-slate-200" />
      )}
    </div>
  );
}
