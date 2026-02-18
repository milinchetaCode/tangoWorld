"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, use, useCallback } from 'react';
import { Check, X, Clock, ArrowLeft, DollarSign, XCircle, Eye, EyeOff } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Application, Event } from '@/types/application';
import toast from 'react-hot-toast';
import ApplicationListSkeleton from '@/components/ApplicationListSkeleton';

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

        // Store original state for rollback
        const originalApplications = [...applications];

        // Optimistic update
        setApplications(prev => prev.map(app =>
            app.id === applicationId ? { ...app, status: newStatus } : app
        ));

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
                toast.success(`Status updated to ${newStatus}`);
            } else {
                // Rollback on error
                setApplications(originalApplications);
                const errorText = await res.text();
                console.error('Failed to update status:', res.status, errorText);
                toast.error(`Failed to update status: ${res.status === 403 ? 'Not authorized' : 'An error occurred'}`);
            }
        } catch (err) {
            // Rollback on error
            setApplications(originalApplications);
            console.error('Error updating status:', err);
            toast.error('Failed to update status. Please try again.');
        }
    };

    const handlePaymentChange = async (applicationId: string, paymentDone: boolean) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Store original state for rollback
        const originalApplications = [...applications];

        // Optimistic update
        setApplications(prev => prev.map(app =>
            app.id === applicationId ? { ...app, paymentDone } : app
        ));

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
                toast.success(`Payment marked as ${paymentDone ? 'paid' : 'unpaid'}`);
            } else {
                // Rollback on error
                setApplications(originalApplications);
                const errorText = await res.text();
                console.error('Failed to update payment status:', res.status, errorText);
                toast.error(`Failed to update payment status: ${res.status === 403 ? 'Not authorized' : 'An error occurred'}`);
            }
        } catch (err) {
            // Rollback on error
            setApplications(originalApplications);
            console.error('Error updating payment:', err);
            toast.error('Failed to update payment status. Please try again.');
        }
    };

    const handlePublicationToggle = async () => {
        const token = localStorage.getItem('token');
        if (!token || !event) return;

        const newPublishedStatus = !event.isPublished;
        const hasAcceptedApplications = applications.some(app => app.status === 'accepted');

        // Show info message if trying to unpublish event with registrations
        if (!newPublishedStatus && hasAcceptedApplications) {
            toast('Event has registrations. It will remain visible but registration will be disabled.', {
                icon: '⚠️',
                duration: 4000,
            });
        }

        // Store original state for rollback
        const originalEvent = { ...event };

        // Optimistic update
        setEvent(prev => prev ? { ...prev, isPublished: newPublishedStatus } : null);

        try {
            const res = await fetch(getApiUrl(`/events/${id}/publication`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isPublished: newPublishedStatus }),
            });

            if (res.ok) {
                toast.success(`Event ${newPublishedStatus ? 'published' : 'unpublished'} successfully`);
            } else {
                // Rollback on error
                setEvent(originalEvent);
                const errorText = await res.text();
                console.error('Failed to update publication status:', res.status, errorText);
                toast.error('Failed to update publication status');
            }
        } catch (err) {
            // Rollback on error
            setEvent(originalEvent);
            console.error('Error updating publication status:', err);
            toast.error('Failed to update publication status. Please try again.');
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Applications</h1>
                    <p className="mt-2 text-slate-600">Loading event applications...</p>
                </div>
                <ApplicationListSkeleton />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
                <div className="text-center py-12 bg-white rounded-2xl ring-1 ring-slate-200">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Error Loading Event</h3>
                    <p className="mt-2 text-sm text-slate-500">{error || 'Event not found'}</p>
                    <div className="mt-6 flex gap-4 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => fetchEventAndApplications()}
                            className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
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
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <button
                            onClick={() => router.push(`/organizer/events/${id}/business`)}
                            className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                        >
                            <DollarSign className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Business Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Publication Status Section */}
            <div className="mb-8">
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {event.isPublished ? (
                                <div className="flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-green-600" />
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">Event is Published</h3>
                                        <p className="text-sm text-slate-600">Visible to public on main page and search results</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <EyeOff className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">Event is Offline</h3>
                                        <p className="text-sm text-slate-600">Not visible to public - only you can see it</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handlePublicationToggle}
                            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
                                event.isPublished
                                    ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                                    : 'bg-green-600 text-white hover:bg-green-500'
                            }`}
                        >
                            {event.isPublished ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    Take Offline
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Publish Online
                                </>
                            )}
                        </button>
                    </div>
                    {!event.isPublished && acceptedApplications.length > 0 && (
                        <div className="mt-4 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircle className="h-5 w-5 text-yellow-600" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                        This event has {acceptedApplications.length} accepted registration{acceptedApplications.length !== 1 ? 's' : ''}. 
                                        It will remain visible to registered participants, but new registrations are disabled.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                                        {application.user?.pastEventsWithOrganizer && application.user.pastEventsWithOrganizer.length > 0 ? (
                                            <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs font-medium text-blue-900 mb-1">
                                                    Past participation ({application.user.pastEventsWithOrganizer.length}):
                                                </p>
                                                <ul className="space-y-1">
                                                    {application.user.pastEventsWithOrganizer.map((event) => (
                                                        <li key={event.id} className="text-xs text-blue-800">
                                                            • {event.title} - {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : application.user?.pastEventsWithOrganizer !== undefined && (
                                            <div className="mt-2">
                                                <p className="text-xs text-slate-500 italic">
                                                    First-time participant with this organizer
                                                </p>
                                            </div>
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
