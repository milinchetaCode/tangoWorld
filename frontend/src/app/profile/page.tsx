"use client";

import { useState } from 'react';

export default function ProfilePage() {
    // Mock user data
    const [user, setUser] = useState({
        name: 'Jane',
        surname: 'Doe',
        email: 'jane.doe@example.com',
        city: 'Berlin',
        gender: 'female',
        dietary_needs: 'Vegetarian',
    });

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        My Profile
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

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
                </dl>
            </div>
        </div>
    );
}
