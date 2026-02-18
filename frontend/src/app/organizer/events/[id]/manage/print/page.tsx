"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { getApiUrl } from '@/lib/api';
import { Application, Event } from '@/types/application';

export default function PrintReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

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
                    // Filter to show only accepted and waitlisted
                    const filteredApps = appsData.filter(
                        (app: Application) => app.status === 'accepted' || app.status === 'waitlisted'
                    );
                    setApplications(filteredApps);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-slate-600">Loading...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-600">Event not found</div>
            </div>
        );
    }

    // Separate accepted and waitlisted
    const acceptedApplications = applications.filter(app => app.status === 'accepted');
    const waitlistedApplications = applications.filter(app => app.status === 'waitlisted');

    return (
        <>
            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-container {
                        max-width: 100% !important;
                        padding: 0 !important;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    thead {
                        display: table-header-group;
                    }
                    h1, h2 {
                        page-break-after: avoid;
                    }
                }
                @page {
                    size: auto;
                    margin: 15mm;
                }
            `}</style>

            <div className="print-container mx-auto max-w-5xl px-4 py-8">
                {/* Header - hidden when printing, shows button to print */}
                <div className="no-print mb-6 flex items-center justify-between border-b pb-4">
                    <h1 className="text-2xl font-bold text-slate-900">Print Report Preview</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                        >
                            Print Report
                        </button>
                    </div>
                </div>

                {/* Event Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
                    <p className="text-lg text-slate-600">
                        {new Date(event.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })} - {new Date(event.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                    <p className="text-md text-slate-600">{event.location}</p>
                    <p className="text-sm text-slate-500 mt-2">
                        Report generated: {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Summary Statistics */}
                <div className="mb-6 grid grid-cols-3 gap-4 border-y py-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{acceptedApplications.length}</div>
                        <div className="text-sm text-slate-600">Accepted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{waitlistedApplications.length}</div>
                        <div className="text-sm text-slate-600">Waitlisted</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">
                            {acceptedApplications.filter(app => app.paymentDone).length}
                        </div>
                        <div className="text-sm text-slate-600">Paid</div>
                    </div>
                </div>

                {/* Accepted Participants */}
                {acceptedApplications.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Accepted Participants</h2>
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        #
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Full Name
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Email
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Gender
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Pricing Option
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Payment Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {acceptedApplications.map((app, index) => (
                                    <tr key={app.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {index + 1}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.name} {app.user?.surname}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.email}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.gender}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.pricingOption || 'N/A'}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm">
                                            <span className={`font-semibold ${app.paymentDone ? 'text-green-700' : 'text-red-700'}`}>
                                                {app.paymentDone ? '✓ Paid' : '✗ Unpaid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Waitlisted Participants */}
                {waitlistedApplications.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Waitlisted Participants</h2>
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        #
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Full Name
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Email
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Gender
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Pricing Option
                                    </th>
                                    <th className="border border-slate-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                        Payment Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {waitlistedApplications.map((app, index) => (
                                    <tr key={app.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {index + 1}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.name} {app.user?.surname}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.email}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.user?.gender}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm text-slate-900">
                                            {app.pricingOption || 'N/A'}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-sm">
                                            <span className={`font-semibold ${app.paymentDone ? 'text-green-700' : 'text-red-700'}`}>
                                                {app.paymentDone ? '✓ Paid' : '✗ Unpaid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty state */}
                {applications.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-slate-600">No accepted or waitlisted participants yet.</p>
                    </div>
                )}
            </div>
        </>
    );
}
