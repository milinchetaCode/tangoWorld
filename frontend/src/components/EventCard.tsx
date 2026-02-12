import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
    id: string;
    title: string;
    startDate?: string;
    endDate?: string;
    date?: string; // Keep for backward compatibility with mock data
    location: string;
    imageUrl?: string;
    capacity?: number;
    acceptedCount?: number;
}

export default function EventCard({ id, title, startDate, endDate, date, location, imageUrl, capacity, acceptedCount }: EventCardProps) {
    const isFull = capacity && acceptedCount && acceptedCount >= capacity;

    const formattedDate = startDate && endDate
        ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : date;

    return (
        <Link href={`/events/${id}`} className="group block">
            <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-rose-200">
                <div className="aspect-[3/2] bg-slate-100 overflow-hidden relative">
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                            <span className="text-sm">No Image</span>
                        </div>
                    )}
                    {isFull && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            Fully Booked
                        </div>
                    )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {title}
                    </h3>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-slate-500">
                            <Calendar className="mr-2 h-4 w-4 shrink-0" />
                            {formattedDate}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                            <MapPin className="mr-2 h-4 w-4 shrink-0" />
                            {location}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center text-xs font-medium text-slate-500">
                            <Users className="mr-1.5 h-3.5 w-3.5" />
                            {acceptedCount ?? 0} attending
                        </div>
                        <span className="text-sm font-medium text-rose-600 group-hover:underline">
                            View Details &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
