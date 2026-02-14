"use client";

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { withAuth } from '@/components/withAuth';
import { User, Mail, MapPin, Users, Utensils, Award, Calendar, Star } from 'lucide-react';

function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleRequestOrganizer = async () => {
        setIsUpdating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl(`/users/${user.id}/request-organizer`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Failed to request organizer status');

            const updatedUser = { ...user, organizerStatus: 'pending' };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('Your request for organizer status has been submitted and is pending approval.');
        } catch (error) {
            setMessage('Error submitting request. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading profile...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-rose-200 to-purple-200 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 relative">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium shadow-sm ${message.includes('Error') ? 'bg-red-50 text-red-800 ring-1 ring-red-600/10' : 'bg-green-50 text-green-800 ring-1 ring-green-600/10'}`}>
                        {message}
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 ring-1 ring-slate-900/5">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-32 sm:h-40"></div>
                    <div className="px-6 sm:px-8 pb-8">
                        <div className="relative -mt-16 sm:-mt-20 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div className="flex items-end gap-6">
                                    <div className="relative">
                                        <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-rose-400 to-purple-500 shadow-2xl ring-4 ring-white flex items-center justify-center">
                                            <span className="text-5xl font-bold text-white">
                                                {user.name?.[0]}{user.surname?.[0]}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg ring-2 ring-rose-100">
                                            <User className="h-5 w-5 text-rose-600" />
                                        </div>
                                    </div>
                                    <div className="pb-2">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                            {user.name} {user.surname}
                                        </h1>
                                        <p className="text-slate-600 mt-1 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {user.city}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {user.organizerStatus === 'none' && (
                                        <button
                                            onClick={handleRequestOrganizer}
                                            disabled={isUpdating}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            <Award className="h-4 w-4" />
                                            {isUpdating ? 'Submitting...' : 'Request Organizer Status'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md hover:shadow-lg ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-all hover:scale-105"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Member Since</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">2024</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                                    <Star className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Events</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">0</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                                    <Award className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Status</span>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                                    user.organizerStatus === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                    user.organizerStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                    'bg-slate-50 text-slate-600 ring-slate-500/10'
                                }`}>
                                    {user.organizerStatus || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 ring-1 ring-slate-900/5">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <User className="h-5 w-5 text-rose-600" />
                            </div>
                            Personal Information
                        </h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-500">Email Address</p>
                                    <p className="text-base font-semibold text-slate-900 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-500">Location</p>
                                    <p className="text-base font-semibold text-slate-900">{user.city}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-500">Gender</p>
                                    <p className="text-base font-semibold text-slate-900 capitalize">{user.gender}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 ring-1 ring-slate-900/5">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Utensils className="h-5 w-5 text-amber-600" />
                            </div>
                            Preferences
                        </h2>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <Utensils className="h-5 w-5 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-500">Dietary Requirements</p>
                                    <p className="text-base font-semibold text-slate-900">
                                        {user.dietaryNeeds || 'No dietary restrictions'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-slate-50 to-rose-50/50 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <Award className="h-6 w-6 text-rose-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Account Status</h3>
                                        <p className="text-sm text-slate-600 mb-3">
                                            {user.organizerStatus === 'approved' 
                                                ? 'You have organizer privileges and can create events.'
                                                : user.organizerStatus === 'pending'
                                                ? 'Your organizer request is pending approval.'
                                                : 'Standard user account. Request organizer status to create events.'
                                            }
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
                                                user.organizerStatus === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                user.organizerStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                'bg-slate-100 text-slate-700 ring-slate-500/10'
                                            }`}>
                                                {user.organizerStatus === 'approved' ? '✓ Approved Organizer' :
                                                 user.organizerStatus === 'pending' ? '⏳ Pending Review' :
                                                 '👤 Standard User'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(ProfilePage);
