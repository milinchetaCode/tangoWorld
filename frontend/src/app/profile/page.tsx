"use client";

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { withAuth } from '@/components/withAuth';
import { User, Mail, MapPin, Users, Utensils, Award, Calendar, Star } from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    surname: string;
    city: string;
    gender: string;
    dietaryNeeds?: string;
    role: string;
    organizerStatus: string;
}

function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isOrganizerConfirmOpen, setIsOrganizerConfirmOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        city: '',
        gender: '',
        dietaryNeeds: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setEditFormData({
                city: userData.city || '',
                gender: userData.gender || '',
                dietaryNeeds: userData.dietaryNeeds || ''
            });
        }
    }, []);

    const handleOpenOrganizerConfirm = () => {
        setIsOrganizerConfirmOpen(true);
    };

    const handleCloseOrganizerConfirm = () => {
        setIsOrganizerConfirmOpen(false);
    };

    const handleRequestOrganizer = async () => {
        if (!user) return;
        
        setIsOrganizerConfirmOpen(false);
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

            // The API returns both the updated user and a new JWT token
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.access_token);
            setMessage('Your request for organizer status has been submitted and is pending approval. Please contact an administrator for approval.');
        } catch {
            setMessage('Error submitting request. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenEditModal = () => {
        if (user) {
            setEditFormData({
                city: user.city || '',
                gender: user.gender || '',
                dietaryNeeds: user.dietaryNeeds || ''
            });
            setIsEditModalOpen(true);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setMessage('');
    };

    const handleEditFormChange = (field: string, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsUpdating(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl(`/users/${user.id}`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const updatedUser = await res.json();
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMessage('Profile updated successfully!');
            setIsEditModalOpen(false);
        } catch {
            setMessage('Error updating profile. Please try again.');
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
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 ring-1 ring-slate-200">
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
                                    <button
                                        type="button"
                                        onClick={handleOpenEditModal}
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
                                {/* TODO: Replace with actual user creation date from backend */}
                                <p className="text-2xl font-bold text-slate-900">2024</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                                    <Star className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Events</span>
                                </div>
                                {/* TODO: Fetch actual event count from API */}
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
                                    {user.organizerStatus === 'approved' ? 'Organizer' : 
                                     user.organizerStatus === 'pending' ? 'Pending Approval' : 
                                     'Dancer'}
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
                        </div>
                    </div>
                </div>

                {/* Request Organizer Status Section - At Bottom */}
                {user.organizerStatus === 'none' && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 sm:p-8 ring-1 ring-slate-200">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Want to organize Tango events?</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Request organizer status to create and manage events on the platform.
                            </p>
                            <button
                                onClick={handleOpenOrganizerConfirm}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Award className="h-4 w-4" />
                                Request Organizer Status
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                                onClick={handleCloseEditModal}
                            ></div>
                            
                            {/* Modal Content */}
                            <div className="relative bg-white rounded-2xl shadow-sm max-w-md w-full p-6 sm:p-8 ring-1 ring-slate-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">Edit Profile</h2>
                                    <button
                                        onClick={handleCloseEditModal}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitEdit} className="space-y-6">
                                    {/* Name and Surname - Read Only */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={user?.name || ''}
                                                disabled
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Surname
                                            </label>
                                            <input
                                                type="text"
                                                value={user?.surname || ''}
                                                disabled
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.city}
                                            onChange={(e) => handleEditFormChange('city', e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={editFormData.gender}
                                            onChange={(e) => handleEditFormChange('gender', e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    {/* Dietary Needs */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Dietary Requirements
                                        </label>
                                        <textarea
                                            value={editFormData.dietaryNeeds}
                                            onChange={(e) => handleEditFormChange('dietaryNeeds', e.target.value)}
                                            rows={3}
                                            placeholder="e.g., vegetarian, vegan, gluten-free, etc."
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleCloseEditModal}
                                            disabled={isUpdating}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Organizer Request Confirmation Modal */}
                {isOrganizerConfirmOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                                onClick={handleCloseOrganizerConfirm}
                            ></div>
                            
                            {/* Modal Content */}
                            <div className="relative bg-white rounded-2xl shadow-sm max-w-md w-full p-6 sm:p-8 ring-1 ring-slate-200">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                                        <Award className="h-6 w-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-2">Request Organizer Status</h2>
                                        <p className="text-sm text-slate-600">
                                            Please confirm that you understand the following:
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-rose-600">1</span>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            This status is <strong>only intended for Tango event organizers</strong> who want to create and manage events.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-rose-600">2</span>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            You should only request this if you plan to <strong>set up events on the platform</strong>.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-bold text-rose-600">3</span>
                                        </div>
                                        <p className="text-sm text-slate-700">
                                            Your request is <strong>subject to approval</strong> by the platform administrators.
                                        </p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseOrganizerConfirm}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRequestOrganizer}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isUpdating ? 'Submitting...' : 'I Understand, Proceed'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuth(ProfilePage);
