import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';

import { getApiUrl } from '@/lib/api';

async function getEvents(search?: string) {
  try {
    const apiUrl = getApiUrl('/events');
    const url = new URL(apiUrl);
    if (search) {
      url.searchParams.append('search', search);
    }
    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const events = await getEvents(search);

  return (
    <div>
      <Hero searchQuery={search} />

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {search ? 'Search Results' : 'Upcoming Events'}
            </h2>
            <p className="mt-2 text-lg leading-8 text-slate-600">
              {search 
                ? `Found ${events.length} event${events.length !== 1 ? 's' : ''} matching "${search}"`
                : 'Handpicked tango events from around the world.'
              }
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {events.length > 0 ? (
              events.map((event: any) => (
                <EventCard
                  key={event.id}
                  {...event}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500 italic">No upcoming events found at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
