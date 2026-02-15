"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Image as ImageIcon, Music, Star, Clock } from 'lucide-react';

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
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Create event', formData);
        router.push('/organizer');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // Convert to number for number inputs
        const finalValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
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
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg shadow-sm hover:from-rose-500 hover:to-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-all"
                    >
                        Create Event
                    </button>
                </div>
            </form>
        </div>
    );
}
