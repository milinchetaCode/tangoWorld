"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, Mail, Lock } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { Application } from '@/types/application';

interface EventFaqAndContactProps {
    eventId: string;
    faq?: string;
    contact?: string;
}

export default function EventFaqAndContact({ eventId, faq, contact }: EventFaqAndContactProps) {
    const [isAccepted, setIsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkApplicationStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const res = await fetch(getApiUrl('/applications/me'), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const applications: Application[] = await res.json();
                    const application = applications.find((app) => app.eventId === eventId);
                    if (application && application.status === 'accepted') {
                        setIsAccepted(true);
                    }
                }
            } catch (err) {
                console.error('Error checking application status:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkApplicationStatus();
    }, [eventId]);

    return (
        <>
            {/* FAQ Section */}
            {faq && (
                <section className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <HelpCircle className="mr-3 h-6 w-6 text-rose-500" />
                        Frequently Asked Questions
                    </h2>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {faq}
                    </div>
                </section>
            )}

            {/* Contact Section - Only visible to accepted users */}
            {contact && !isLoading && (
                <section className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Mail className="mr-3 h-6 w-6 text-rose-500" />
                        Contact Information
                    </h2>
                    {isAccepted ? (
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {contact}
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <Lock className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-900">Contact information is private</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    This information is only visible to dancers who have been accepted to this event.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
