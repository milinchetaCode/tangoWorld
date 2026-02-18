export interface Application {
    id: string;
    userId: string;
    eventId: string;
    status: 'applied' | 'accepted' | 'waitlisted' | 'rejected' | 'cancelled';
    paymentDone: boolean;
    pricingOption?: string;
    numberOfDays?: number;
    totalPrice?: number;
    appliedAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        surname: string;
        email: string;
        gender: string;
        dietaryNeeds?: string;
        pastEventsWithOrganizer?: {
            id: string;
            title: string;
            startDate: string;
            endDate: string;
        }[];
    };
}

export interface Event {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    venue: string;
    imageUrl?: string;
    guests?: string;
    djs?: string;
    schedule?: string;
    capacity: number;
    maleCapacity: number;
    femaleCapacity: number;
    organizerId: string;
    status: string;
    isPublished: boolean;
    priceFullEventFood?: number;
    priceFullEventAccommodation?: number;
    priceFullEventBoth?: number;
    priceDailyFood?: number;
    priceDailyNoFood?: number;
    acceptedCount?: number;
    createdAt: string;
    updatedAt: string;
}
