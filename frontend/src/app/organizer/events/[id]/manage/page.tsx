"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, use, useCallback } from 'react';
import { Check, X, Clock, ArrowLeft, DollarSign } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Application, Event } from '@/types/application';

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEventAndApplications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch event details
            const eventRes = await fetch(getApiUrl(`/events/${id}`));
            if (!eventRes.ok) {
                throw new Error('Failed to fetch event');
            }
            const eventData = await eventRes.json();
            setEvent(eventData);

            // Fetch applications for this event
            const appsRes = await fetch(getApiUrl(`/applications/event/${id}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (appsRes.ok) {
                const appsData = await appsRes.json();
                setApplications(appsData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load event data');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchEventAndApplications();
    }, [fetchEventAndApplications]);

    const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(getApiUrl(`/applications/${applicationId}/status`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                // Update local state
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                ));
            } else {
                const errorText = await res.text();
                console.error('Failed to update status:', res.status, errorText);
                alert(`Failed to update status: ${res.status === 403 ? 'Not authorized' : 'An error occurred'}`);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const handlePaymentChange = async (applicationId: string, paymentDone: boolean) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(getApiUrl(`/applications/${applicationId}/payment`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentDone }),
            });

            if (res.ok) {
                // Update local state
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, paymentDone } : app
                ));
            } else {
                const errorText = await res.text();
                console.error('Failed to update payment status:', res.status, errorText);
                alert(`Failed to update payment status: ${res.status === 403 ? 'Not authorized' : 'An error occurred'}`);
            }
        } catch (err) {
            console.error('Error updating payment:', err);
            alert('Failed to update payment status. Please try again.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 ring-1 ring-inset ring-green-700/20">Accepted</span>;
            case 'waitlisted': return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-700/20">Waitlisted</span>;
            case 'rejected': return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-700/20">Rejected</span>;
            default: return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-700/20">Applied</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                <p className="text-red-600">{error || 'Event not found'}</p>
            </div>
        );
    }

    // Calculate statistics
    const acceptedApplications = applications.filter(app => app.status === 'accepted');
    const waitlistedApplications = applications.filter(app => app.status === 'waitlisted');
    const rejectedApplications = applications.filter(app => app.status === 'rejected');
    const appliedApplications = applications.filter(app => app.status === 'applied');

    const acceptedMale = acceptedApplications.filter(app => app.user?.gender === 'male').length;
    const acceptedFemale = acceptedApplications.filter(app => app.user?.gender === 'female').length;
    
    const waitlistedMale = waitlistedApplications.filter(app => app.user?.gender === 'male').length;
    const waitlistedFemale = waitlistedApplications.filter(app => app.user?.gender === 'female').length;
    
    const rejectedMale = rejectedApplications.filter(app => app.user?.gender === 'male').length;
    const rejectedFemale = rejectedApplications.filter(app => app.user?.gender === 'female').length;
    
    const appliedMale = appliedApplications.filter(app => app.user?.gender === 'male').length;
    const appliedFemale = appliedApplications.filter(app => app.user?.gender === 'female').length;

    const acceptedCount = acceptedApplications.length;
    const paidCount = acceptedApplications.filter(app => app.paymentDone).length;

    const malePercentage = event.maleCapacity > 0 ? (acceptedMale / event.maleCapacity) * 100 : 0;
    const femalePercentage = event.femaleCapacity > 0 ? (acceptedFemale / event.femaleCapacity) * 100 : 0;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <button onClick={() => router.back()} className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Dashboard
                </button>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Manage: {event.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Total Capacity: {acceptedCount} / {event.capacity} • Paid: {paidCount} / {acceptedCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Accepted Dancers Bar */}
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900 mb-4">Accepted Dancers</h3>
                    
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-slate-700">
                            <div className="flex gap-4">
                                <span>
                                    <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-1" aria-hidden="true"></span>
                                    <span className="sr-only">Male dancers: </span>Male: {acceptedMale} / {event.maleCapacity}
                                </span>
                                <span>
                                    <span className="inline-block w-3 h-3 bg-pink-600 rounded mr-1" aria-hidden="true"></span>
                                    <span className="sr-only">Female dancers: </span>Female: {acceptedFemale} / {event.femaleCapacity}
                                </span>
                            </div>
                            <span className="font-medium">{acceptedCount} / {event.capacity}</span>
                        </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-6 flex overflow-hidden">
                        <div 
                            className="bg-blue-600 h-6 transition-all duration-300 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(acceptedMale / event.capacity) * 100}%` }}
                            title={`Male: ${acceptedMale} (${malePercentage.toFixed(0)}% of male capacity)`}
                        >
                            {acceptedMale > 0 && <span className="px-1">{acceptedMale}</span>}
                        </div>
                        <div 
                            className="bg-pink-600 h-6 transition-all duration-300 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(acceptedFemale / event.capacity) * 100}%` }}
                            title={`Female: ${acceptedFemale} (${femalePercentage.toFixed(0)}% of female capacity)`}
                        >
                            {acceptedFemale > 0 && <span className="px-1">{acceptedFemale}</span>}
                        </div>
                    </div>
                </div>

                {/* Status Summary */}
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900 mb-4">Status Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Applied</span>
                            <div className="flex gap-2 text-sm">
                                <span className="text-blue-600 font-medium">M: {appliedMale}</span>
                                <span className="text-pink-600 font-medium">F: {appliedFemale}</span>
                                <span className="text-slate-900 font-semibold">({appliedApplications.length})</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Waitlisted</span>
                            <div className="flex gap-2 text-sm">
                                <span className="text-blue-600 font-medium">M: {waitlistedMale}</span>
                                <span className="text-pink-600 font-medium">F: {waitlistedFemale}</span>
                                <span className="text-slate-900 font-semibold">({waitlistedApplications.length})</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Rejected</span>
                            <div className="flex gap-2 text-sm">
                                <span className="text-blue-600 font-medium">M: {rejectedMale}</span>
                                <span className="text-pink-600 font-medium">F: {rejectedFemale}</span>
                                <span className="text-slate-900 font-semibold">({rejectedApplications.length})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl">
                <div className="px-4 py-6 sm:px-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900">Participants</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Manage applications and payment status.</p>
                </div>
                <div className="border-t border-slate-200">
                    {applications.length === 0 ? (
                        <div className="px-4 py-8 sm:px-6 text-center text-slate-500">
                            No applications yet
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-slate-200">
                            {applications.map((application) => (
                                <li key={application.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap px-4 sm:px-6 hover:bg-slate-50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold leading-6 text-slate-900">
                                            {application.user?.name} {application.user?.surname}
                                            {application.user?.gender && (
                                                <span className="ml-2 text-slate-600 font-normal">
                                                    ({application.user.gender === 'male' ? 'M' : application.user.gender === 'female' ? 'F' : application.user.gender})
                                                </span>
                                            )}
                                            {application.paymentDone && (
                                                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                    Paid
                                                </span>
                                            )}
                                        </p>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-600">
                                            <p className="truncate">{application.user?.email}</p>
                                            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                            <p className="whitespace-nowrap">Applied: {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        {application.user?.dietaryNeeds && (
                                            <p className="mt-1 text-xs text-slate-600">Dietary needs: {application.user.dietaryNeeds}</p>
                                        )}
                                        {application.pricingOption && (
                                            <p className="mt-1 text-xs text-slate-600">
                                                <DollarSign className="inline h-3 w-3 mr-1" />
                                                {application.pricingOption.replace(/_/g, ' ')}
                                                {application.numberOfDays && ` (${application.numberOfDays} days)`}
                                                {application.totalPrice && ` - $${Number(application.totalPrice).toFixed(2)}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex w-full flex-none gap-x-4 sm:w-auto items-center">
                                        {getStatusBadge(application.status)}

                                        <div className="flex gap-2">
                                            {application.status !== 'accepted' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'accepted')}
                                                    className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                                                    title="Accept"
                                                >
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </button>
                                            )}
                                            {application.status !== 'waitlisted' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'waitlisted')}
                                                    className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                                                    title="Waitlist"
                                                >
                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                </button>
                                            )}
                                            {application.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                                    className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                                                    title="Reject"
                                                >
                                                    <X className="h-4 w-4 text-red-600" />
                                                </button>
                                            )}
                                            {application.status === 'accepted' && (
                                                <button
                                                    onClick={() => handlePaymentChange(application.id, !application.paymentDone)}
                                                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-sm ring-1 ring-inset ${
                                                        application.paymentDone 
                                                            ? 'bg-green-600 text-white ring-green-600 hover:bg-green-700' 
                                                            : 'bg-white text-slate-900 ring-slate-200 hover:bg-slate-50'
                                                    }`}
                                                    title={application.paymentDone ? "Mark as unpaid" : "Mark as paid"}
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
