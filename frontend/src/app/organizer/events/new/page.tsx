"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Image as ImageIcon, Music, Star, Clock, DollarSign } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { geocodeLocation, GEOCODING_DELAY_MS } from '@/lib/geocoding';

// Debounce delay for geocoding user input (slightly shorter than API rate limit)
const GEOCODING_DEBOUNCE_MS = 1000;

export default function CreateEventPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        location: '',
        latitude: '',
        longitude: '',
        venue: '',
        guests: '',
        djs: '',
        schedule: '',
        imageUrl: '',
        capacity: 100,
        maleCapacity: 50,
        femaleCapacity: 50,
        priceFullEventNoFoodNoAccommodation: '',
        priceFullEventFood: '',
        priceFullEventAccommodation: '',
        priceFullEventBoth: '',
        priceDailyFood: '',
        priceDailyNoFood: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [geocodingError, setGeocodingError] = useState<string | null>(null);
    const [manualCoordinates, setManualCoordinates] = useState(false);

    // Helper function to safely parse float values
    const parseFloatOrNull = (value: string | number): number | null => {
        if (value === '' || value === null || value === undefined) {
            return null;
        }
        const parsed = parseFloat(String(value));
        return isNaN(parsed) ? null : parsed;
    };

    // Automatically geocode location when it changes
    useEffect(() => {
        let isMounted = true;

        const geocodeLocationField = async () => {
            const location = formData.location.trim();
            
            // Only geocode if location is provided and coordinates were not manually set
            if (!location || manualCoordinates) {
                return;
            }

            setIsGeocoding(true);
            setGeocodingError(null);

            try {
                const coords = await geocodeLocation(location);
                
                if (coords && isMounted) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: coords.latitude.toString(),
                        longitude: coords.longitude.toString(),
                    }));
                } else if (isMounted) {
                    setGeocodingError('Could not find coordinates for this location. You can enter them manually.');
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error geocoding location:', error);
                    setGeocodingError('Error geocoding location. You can enter coordinates manually.');
                }
            } finally {
                if (isMounted) {
                    setIsGeocoding(false);
                }
            }
        };

        // Debounce the geocoding to avoid too many API calls
        const timeoutId = setTimeout(geocodeLocationField, GEOCODING_DEBOUNCE_MS);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [formData.location, manualCoordinates]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please log in again.');
            }

            // Validate dates
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Please provide valid start and end dates.');
            }

            // Prepare the event data
            const eventData = {
                title: formData.title,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location: formData.location,
                latitude: parseFloatOrNull(formData.latitude),
                longitude: parseFloatOrNull(formData.longitude),
                venue: formData.venue,
                imageUrl: formData.imageUrl || null,
                guests: formData.guests || null,
                djs: formData.djs || null,
                schedule: formData.schedule || null,
                capacity: Number(formData.capacity),
                maleCapacity: Number(formData.maleCapacity),
                femaleCapacity: Number(formData.femaleCapacity),
                priceFullEventNoFoodNoAccommodation: parseFloatOrNull(formData.priceFullEventNoFoodNoAccommodation),
                priceFullEventFood: parseFloatOrNull(formData.priceFullEventFood),
                priceFullEventAccommodation: parseFloatOrNull(formData.priceFullEventAccommodation),
                priceFullEventBoth: parseFloatOrNull(formData.priceFullEventBoth),
                priceDailyFood: parseFloatOrNull(formData.priceDailyFood),
                priceDailyNoFood: parseFloatOrNull(formData.priceDailyNoFood),
            };

            // Make API call to create event
            const response = await fetch(getApiUrl('/events'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create event');
            }

            const createdEvent = await response.json();
            console.log('Event created successfully:', createdEvent);

            // Redirect to organizer page
            router.push('/organizer');
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Convert to number for number inputs
        const finalValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
        
        // Mark coordinates as manual if user is editing them
        if (name === 'latitude' || name === 'longitude') {
            setManualCoordinates(true);
        }
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const capacityWarning = (formData.maleCapacity + formData.femaleCapacity) > formData.capacity;
    const capacityPercentage = Math.min(((formData.maleCapacity + formData.femaleCapacity) / formData.capacity) * 100, 100);

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                    Create New Event
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Fill in the details below to create your tango event. All fields marked with * are required.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
                        <p className="font-medium">Error creating event</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Basic Information Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-900">
                                Event Title *
                            </label>
                            <p className="mt-1 text-xs text-slate-500">Choose a clear, descriptive name for your event</p>
                            <div className="mt-2">
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Buenos Aires Tango Marathon 2026"
                                    className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-slate-900">
                                    Start Date *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">When does your event begin?</p>
                                <div className="mt-2">
                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-slate-900">
                                    End Date *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">When does your event end?</p>
                                <div className="mt-2">
                                    <input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate}
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Location</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-slate-900">
                                    City *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">Where is the event taking place?</p>
                                <div className="mt-2">
                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g., Buenos Aires, Argentina"
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                                {isGeocoding && (
                                    <p className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                        <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                                        Finding coordinates...
                                    </p>
                                )}
                                {geocodingError && (
                                    <p className="mt-2 text-xs text-amber-600">{geocodingError}</p>
                                )}
                                {!isGeocoding && formData.latitude && formData.longitude && formData.location && (
                                    <p className="mt-2 text-xs text-green-600">✓ Coordinates found automatically</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="venue" className="block text-sm font-medium text-slate-900">
                                    Venue *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">Specific venue or address</p>
                                <div className="mt-2">
                                    <input
                                        id="venue"
                                        name="venue"
                                        type="text"
                                        required
                                        value={formData.venue}
                                        onChange={handleChange}
                                        placeholder="e.g., La Catedral Club"
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="latitude" className="block text-sm font-medium text-slate-900">
                                    Latitude (optional)
                                </label>
                                <p className="mt-1 text-xs text-slate-500">For map display (e.g., 48.8566)</p>
                                <div className="mt-2">
                                    <input
                                        id="latitude"
                                        name="latitude"
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        placeholder="e.g., 48.8566"
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="longitude" className="block text-sm font-medium text-slate-900">
                                    Longitude (optional)
                                </label>
                                <p className="mt-1 text-xs text-slate-500">For map display (e.g., 2.3522)</p>
                                <div className="mt-2">
                                    <input
                                        id="longitude"
                                        name="longitude"
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        placeholder="e.g., 2.3522"
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lineup Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Lineup & Schedule</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="guests" className="block text-sm font-medium text-slate-900">
                                Guest Teachers / Stars
                            </label>
                            <p className="mt-1 text-xs text-slate-500">List featured teachers or performers (one per line)</p>
                            <div className="mt-2">
                                <textarea
                                    id="guests"
                                    name="guests"
                                    rows={3}
                                    value={formData.guests}
                                    onChange={handleChange}
                                    placeholder="e.g., Carlos Gavito&#10;Mariana Montes&#10;Sebastian Arce"
                                    className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="djs" className="block text-sm font-medium text-slate-900">
                                DJs
                            </label>
                            <p className="mt-1 text-xs text-slate-500">List DJs performing at the event (one per line)</p>
                            <div className="mt-2">
                                <textarea
                                    id="djs"
                                    name="djs"
                                    rows={3}
                                    value={formData.djs}
                                    onChange={handleChange}
                                    placeholder="e.g., DJ Tanguero&#10;DJ Milonguero"
                                    className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="schedule" className="block text-sm font-medium text-slate-900">
                                Daily Schedule
                            </label>
                            <p className="mt-1 text-xs text-slate-500">Provide a detailed schedule for each day</p>
                            <div className="mt-2">
                                <textarea
                                    id="schedule"
                                    name="schedule"
                                    rows={6}
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    placeholder="Day 1:&#10;14:00 - Workshop with Carlos Gavito&#10;21:00 - Milonga&#10;&#10;Day 2:&#10;14:00 - Workshop with Mariana Montes&#10;21:00 - Grand Milonga"
                                    className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capacity Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Capacity Settings</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div>
                                <label htmlFor="capacity" className="block text-sm font-medium text-slate-900">
                                    Total Capacity *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">Maximum attendees</p>
                                <div className="mt-2">
                                    <input
                                        id="capacity"
                                        name="capacity"
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="maleCapacity" className="block text-sm font-medium text-slate-900">
                                    Male Capacity *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">Max male dancers</p>
                                <div className="mt-2">
                                    <input
                                        id="maleCapacity"
                                        name="maleCapacity"
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.maleCapacity}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="femaleCapacity" className="block text-sm font-medium text-slate-900">
                                    Female Capacity *
                                </label>
                                <p className="mt-1 text-xs text-slate-500">Max female dancers</p>
                                <div className="mt-2">
                                    <input
                                        id="femaleCapacity"
                                        name="femaleCapacity"
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.femaleCapacity}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Capacity Visualization */}
                        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-700">Capacity Breakdown</span>
                                <span className="text-sm text-slate-600">
                                    {formData.maleCapacity + formData.femaleCapacity} / {formData.capacity}
                                </span>
                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div className="h-full flex">
                                    <div
                                        className="bg-blue-500 transition-all duration-300"
                                        style={{ width: `${(formData.maleCapacity / formData.capacity) * 100}%` }}
                                    ></div>
                                    <div
                                        className="bg-pink-500 transition-all duration-300"
                                        style={{ width: `${(formData.femaleCapacity / formData.capacity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-slate-600">Male: {formData.maleCapacity}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                                    <span className="text-slate-600">Female: {formData.femaleCapacity}</span>
                                </div>
                            </div>

                            {capacityWarning && (
                                <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <span>Warning: Male + Female capacity ({formData.maleCapacity + formData.femaleCapacity}) exceeds total capacity ({formData.capacity})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Event Image</h3>
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-900">
                            Image URL
                        </label>
                        <p className="mt-1 text-xs text-slate-500">Provide a URL to an event poster or promotional image</p>
                        <div className="mt-2">
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/event-poster.jpg"
                                className="block w-full rounded-xl border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                <img
                                    src={formData.imageUrl}
                                    alt="Event preview"
                                    className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-200"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <DollarSign className="h-5 w-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Pricing Options</h3>
                    </div>

                    <p className="text-sm text-slate-600 mb-6">
                        Set different pricing options for your event. Leave fields empty if that option is not available. 
                        Pricing is optional - you can leave all fields empty if the event is free or payment will be arranged separately.
                    </p>

                    <div className="space-y-6">
                        {/* Full Event Pricing */}
                        <div className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
                            <h4 className="text-sm font-semibold text-slate-900 mb-4">Full Event Pricing</h4>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label htmlFor="priceFullEventNoFoodNoAccommodation" className="block text-sm font-medium text-slate-900">
                                        Basic (No Food/Accommodation)
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Full event base price</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceFullEventNoFoodNoAccommodation"
                                            name="priceFullEventNoFoodNoAccommodation"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceFullEventNoFoodNoAccommodation}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="priceFullEventFood" className="block text-sm font-medium text-slate-900">
                                        Including Food
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Full event with meals</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceFullEventFood"
                                            name="priceFullEventFood"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceFullEventFood}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="priceFullEventAccommodation" className="block text-sm font-medium text-slate-900">
                                        Including Accommodation
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Full event with lodging</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceFullEventAccommodation"
                                            name="priceFullEventAccommodation"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceFullEventAccommodation}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="priceFullEventBoth" className="block text-sm font-medium text-slate-900">
                                        Including Both
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Food + accommodation</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceFullEventBoth"
                                            name="priceFullEventBoth"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceFullEventBoth}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Pricing */}
                        <div className="border-t border-slate-200 pt-6">
                            <h4 className="text-sm font-semibold text-slate-900 mb-4">Daily Pricing</h4>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="priceDailyFood" className="block text-sm font-medium text-slate-900">
                                        Daily with Food
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Per-day price with meals</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceDailyFood"
                                            name="priceDailyFood"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceDailyFood}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="priceDailyNoFood" className="block text-sm font-medium text-slate-900">
                                        Daily without Food
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">Per-day price, no meals</p>
                                    <div className="mt-2 relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            id="priceDailyNoFood"
                                            name="priceDailyNoFood"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.priceDailyNoFood}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="block w-full rounded-xl border-0 py-2.5 pl-7 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white rounded-lg shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg shadow-sm hover:from-rose-500 hover:to-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating...' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
