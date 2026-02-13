"use client";

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';

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

    if (!user) return <div className="p-10 text-center">Loading profile...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            My Profile
                        </h2>
                    </div>
                    <div className="mt-4 flex flex-col md:flex-row md:ml-4 md:mt-0 gap-3">
                        {user.organizerStatus === 'none' && (
                            <button
                                onClick={handleRequestOrganizer}
                                disabled={isUpdating}
                                className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
                            >
                                {isUpdating ? 'Submitting...' : 'Request Organizer Status'}
                            </button>
                        )}
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-800 ring-1 ring-red-600/10' : 'bg-green-50 text-green-800 ring-1 ring-green-600/10'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-8 border-t border-slate-200 pt-8">
                    <dl className="divide-y divide-slate-100">
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">Full name</dt>
                            <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{user.name} {user.surname}</dd>
                        </div>
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">Email address</dt>
                            <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{user.email}</dd>
                        </div>
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">City</dt>
                            <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{user.city}</dd>
                        </div>
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">Gender</dt>
                            <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0 capitalize">{user.gender}</dd>
                        </div>
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">Dietary Needs</dt>
                            <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">{user.dietary_needs}</dd>
                        </div>
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-slate-900">Organizer Status</dt>
                            <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${user.organizerStatus === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                    user.organizerStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                        'bg-slate-50 text-slate-600 ring-slate-500/10'
                                    }`}>
                                    {user.organizerStatus || 'None'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            );
}

            import {withAuth} from '@/components/withAuth';
            export default withAuth(ProfilePage);
