"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import { Application } from '@/types/application';
import toast from 'react-hot-toast';

// Format a YYYY-MM-DD date string for display (avoids timezone shift from Date constructor)
const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-US', options);

interface EventRegistrationProps {
    eventId: string;
    capacity: number;
    acceptedCount: number;
    startDate: string;
    endDate: string;
    isPublished: boolean;
    priceFullEventNoFoodNoAccommodation?: number;
    priceFullEventFood?: number;
    priceFullEventAccommodation?: number;
    priceFullEventBoth?: number;
    priceDailyFood?: number;
    priceDailyNoFood?: number;
    dailyRateDates?: string[];
}

export default function EventRegistration({ eventId, capacity, acceptedCount, startDate, endDate, isPublished, priceFullEventNoFoodNoAccommodation, priceFullEventFood, priceFullEventAccommodation, priceFullEventBoth, priceDailyFood, priceDailyNoFood, dailyRateDates }: EventRegistrationProps) {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userApplication, setUserApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPricingOption, setSelectedPricingOption] = useState<string>('');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const isFull = capacity > 0 && acceptedCount >= capacity;

    // Toggle a date in/out of the selectedDates array
    const toggleDate = (date: string) => {
        setSelectedDates(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    // Calculate total price based on selection
    const calculateTotalPrice = () => {
        if (!selectedPricingOption) return null;
        
        switch (selectedPricingOption) {
            case 'full_no_food_no_accommodation':
                return priceFullEventNoFoodNoAccommodation ?? null;
            case 'full_food':
                return priceFullEventFood ?? null;
            case 'full_accommodation':
                return priceFullEventAccommodation ?? null;
            case 'full_both':
                return priceFullEventBoth ?? null;
            case 'daily_food':
                return priceDailyFood && selectedDates.length > 0
                    ? priceDailyFood * selectedDates.length
                    : null;
            case 'daily_no_food':
                return priceDailyNoFood && selectedDates.length > 0
                    ? priceDailyNoFood * selectedDates.length
                    : null;
            default:
                return null;
        }
    };

    const totalPrice = calculateTotalPrice();

    const checkUserApplication = useCallback(async (token: string) => {
        try {
            const res = await fetch(getApiUrl('/applications/me'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const applications: Application[] = await res.json();
                const existingApp = applications.find((app) => app.eventId === eventId);
                if (existingApp) {
                    // Parse selectedDates from JSON string if present
                    if (typeof (existingApp as any).selectedDates === 'string') {
                        try {
                            (existingApp as any).selectedDates = JSON.parse((existingApp as any).selectedDates);
                        } catch {
                            (existingApp as any).selectedDates = [];
                        }
                    }
                    setUserApplication(existingApp);
                }
            }
        } catch (err) {
            console.error('Error checking user application:', err);
        }
    }, [eventId]);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        // If logged in, check if user has already applied
        if (token) {
            checkUserApplication(token);
        }
    }, [checkUserApplication]);

    const handleApply = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Validate pricing option selection if pricing is available
        const hasPricing = priceFullEventNoFoodNoAccommodation || priceFullEventFood || priceFullEventAccommodation || priceFullEventBoth || priceDailyFood || priceDailyNoFood;
        if (hasPricing && !selectedPricingOption) {
            toast.error('Please select a pricing option');
            return;
        }

        // Validate date selection for daily pricing
        if (selectedPricingOption.startsWith('daily_') && selectedDates.length === 0) {
            toast.error('Please select at least one date for the daily pass');
            return;
        }

        setIsLoading(true);

        try {
            const body: any = {};
            if (selectedPricingOption) {
                body.pricingOption = selectedPricingOption;
                if (selectedPricingOption.startsWith('daily_')) {
                    body.numberOfDays = selectedDates.length;
                    body.selectedDates = JSON.stringify([...selectedDates].sort());
                }
                if (totalPrice !== null) {
                    body.totalPrice = totalPrice;
                }
            }

            const res = await fetch(getApiUrl(`/applications/${eventId}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const application = await res.json();
                setUserApplication(application);
                toast.success('Application submitted successfully!');
                // Refresh the page to update the accepted count
                router.refresh();
            } else {
                const errorData = await res.json();
                const errorMsg = errorData.message || 'Failed to apply';
                toast.error(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'An error occurred. Please try again.';
            toast.error(errorMsg);
            console.error('Error applying to event:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase tracking-wider">
                        Accepted
                    </span>
                );
            case 'waitlisted':
                return (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 ring-1 ring-inset ring-yellow-600/20 uppercase tracking-wider">
                        Waitlisted
                    </span>
                );
            case 'applied':
                return (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase tracking-wider">
                        Pending Review
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Registration</h3>

            <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium">Status</span>
                    {userApplication ? (
                        getStatusBadge(userApplication.status)
                    ) : isFull ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10 uppercase tracking-wider">
                            Fully Booked
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20 uppercase tracking-wider">
                            Open
                        </span>
                    )}
                </div>
                <div className="px-1 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Total Capacity</span>
                        <span className="font-bold text-slate-900">{capacity} seats</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Attending</span>
                        <span className="font-bold text-slate-900">{acceptedCount || 0} dancers</span>
                    </div>
                </div>
                {/* Progress bar */}
                {capacity > 0 && (
                    <div className="space-y-2">
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(((acceptedCount || 0) / capacity) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {Math.round(((acceptedCount || 0) / capacity) * 100)}% Full
                        </p>
                    </div>
                )}
            </div>

            {userApplication ? (
                <div className="p-4 bg-slate-50 rounded-xl ring-1 ring-slate-200">
                    <p className="text-sm text-center text-slate-700 leading-normal font-medium">
                        You have applied to this event. The organizer will review your application.
                    </p>
                    {userApplication.pricingOption && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-600">
                                <span className="font-semibold">Selected option:</span>{' '}
                                {userApplication.pricingOption.replace(/_/g, ' ')}
                                {userApplication.numberOfDays && userApplication.numberOfDays > 0 && ` (${userApplication.numberOfDays} ${userApplication.numberOfDays === 1 ? 'day' : 'days'})`}
                            </p>
                            {userApplication.selectedDates && userApplication.selectedDates.length > 0 && (
                                <div className="mt-1">
                                    <span className="text-xs font-semibold text-slate-600">Days:</span>
                                    <ul className="mt-0.5 space-y-0.5">
                                        {userApplication.selectedDates.map((date) => (
                                            <li key={date} className="text-xs text-slate-600 pl-2">
                                                {formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {userApplication.totalPrice && (
                                <p className="text-xs text-slate-600 mt-1">
                                    <span className="font-semibold">Total:</span> ${Number(userApplication.totalPrice).toFixed(2)}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : isLoggedIn ? (
                <>
                    {/* Pricing Selection */}
                    {(priceFullEventNoFoodNoAccommodation || priceFullEventFood || priceFullEventAccommodation || priceFullEventBoth || priceDailyFood || priceDailyNoFood) && (
                        <div className="mb-6 space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Select Pricing Option</h4>
                            
                            {/* Full Event Options */}
                            {(priceFullEventNoFoodNoAccommodation || priceFullEventFood || priceFullEventAccommodation || priceFullEventBoth) && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Event</p>
                                    
                                    {priceFullEventNoFoodNoAccommodation && (
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="pricingOption"
                                                    value="full_no_food_no_accommodation"
                                                    checked={selectedPricingOption === 'full_no_food_no_accommodation'}
                                                    onChange={(e) => setSelectedPricingOption(e.target.value)}
                                                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                />
                                                <span className="ml-3 text-sm text-slate-900">Basic (No Food/Accommodation)</span>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600">${Number(priceFullEventNoFoodNoAccommodation).toFixed(2)}</span>
                                        </label>
                                    )}
                                    
                                    {priceFullEventFood && (
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="pricingOption"
                                                    value="full_food"
                                                    checked={selectedPricingOption === 'full_food'}
                                                    onChange={(e) => setSelectedPricingOption(e.target.value)}
                                                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                />
                                                <span className="ml-3 text-sm text-slate-900">Including Food</span>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600">${Number(priceFullEventFood).toFixed(2)}</span>
                                        </label>
                                    )}
                                    
                                    {priceFullEventAccommodation && (
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="pricingOption"
                                                    value="full_accommodation"
                                                    checked={selectedPricingOption === 'full_accommodation'}
                                                    onChange={(e) => setSelectedPricingOption(e.target.value)}
                                                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                />
                                                <span className="ml-3 text-sm text-slate-900">Including Accommodation</span>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600">${Number(priceFullEventAccommodation).toFixed(2)}</span>
                                        </label>
                                    )}
                                    
                                    {priceFullEventBoth && (
                                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="pricingOption"
                                                    value="full_both"
                                                    checked={selectedPricingOption === 'full_both'}
                                                    onChange={(e) => setSelectedPricingOption(e.target.value)}
                                                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                />
                                                <span className="ml-3 text-sm text-slate-900">Including Food & Accommodation</span>
                                            </div>
                                            <span className="text-sm font-bold text-rose-600">${Number(priceFullEventBoth).toFixed(2)}</span>
                                        </label>
                                    )}
                                </div>
                            )}
                            
                            {/* Daily Options */}
                            {(priceDailyFood || priceDailyNoFood) && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Daily Rate</p>
                                    
                                    {priceDailyFood && (
                                        <label className="block p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="pricingOption"
                                                        value="daily_food"
                                                        checked={selectedPricingOption === 'daily_food'}
                                                        onChange={(e) => { setSelectedPricingOption(e.target.value); setSelectedDates([]); }}
                                                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                    />
                                                    <span className="ml-3 text-sm text-slate-900">Daily with Food</span>
                                                </div>
                                                <span className="text-sm font-bold text-rose-600">${Number(priceDailyFood).toFixed(2)}/day</span>
                                            </div>
                                        </label>
                                    )}
                                    
                                    {priceDailyNoFood && (
                                        <label className="block p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="pricingOption"
                                                        value="daily_no_food"
                                                        checked={selectedPricingOption === 'daily_no_food'}
                                                        onChange={(e) => { setSelectedPricingOption(e.target.value); setSelectedDates([]); }}
                                                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                                                    />
                                                    <span className="ml-3 text-sm text-slate-900">Daily without Food</span>
                                                </div>
                                                <span className="text-sm font-bold text-rose-600">${Number(priceDailyNoFood).toFixed(2)}/day</span>
                                            </div>
                                        </label>
                                    )}
                                    
                                    {/* Date checkboxes — shown once a daily option is selected */}
                                    {selectedPricingOption.startsWith('daily_') && dailyRateDates && dailyRateDates.length > 0 && (
                                        <div className="mt-3 pl-1">
                                            <p className="text-xs font-semibold text-slate-700 mb-2">
                                                Select your day(s):
                                            </p>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {dailyRateDates.map((date) => (
                                                    <label
                                                        key={date}
                                                        className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                                                            selectedDates.includes(date)
                                                                ? 'bg-rose-50 border-rose-400 text-rose-800 font-medium'
                                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            value={date}
                                                            checked={selectedDates.includes(date)}
                                                            onChange={() => toggleDate(date)}
                                                            className="h-3.5 w-3.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300 mr-2"
                                                        />
                                                        {formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </label>
                                                ))}
                                            </div>
                                            {selectedDates.length > 0 && (
                                                <p className="mt-1.5 text-xs text-slate-500">
                                                    {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'} selected
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Total Price Display */}
                            {totalPrice !== null && totalPrice !== undefined && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-900">Total Price</span>
                                        <span className="text-lg font-bold text-rose-600">${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button
                        onClick={handleApply}
                        disabled={isLoading || !isPublished}
                        aria-busy={isLoading}
                        aria-label={isLoading ? 'Submitting application...' : !isPublished ? 'Registration is not available' : 'Apply to participate in this event'}
                        className={`w-full rounded-xl px-6 py-4 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] ${
                            isLoading
                                ? 'bg-slate-400 cursor-wait'
                                : !isPublished
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-rose-600 hover:bg-rose-500 hover:shadow-md'
                        }`}
                    >
                        {isLoading ? 'Applying...' : !isPublished ? 'Registration Not Available' : 'Apply to Participate'}
                    </button>
                    
                    {!isPublished && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                            <p className="text-xs text-center text-yellow-800 leading-normal">
                                Registration for this event is currently closed.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <button
                        onClick={() => router.push('/login')}
                        disabled={!isPublished}
                        className={`w-full rounded-xl px-6 py-4 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] ${
                            !isPublished
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-rose-600 hover:bg-rose-500 hover:shadow-md'
                        }`}
                    >
                        {!isPublished ? 'Registration Not Available' : 'Log In to Apply'}
                    </button>
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-[11px] text-center text-slate-500 leading-normal">
                            Registration requires a verified dancer profile.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
