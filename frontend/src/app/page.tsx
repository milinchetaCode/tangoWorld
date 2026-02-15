import Hero from '@/components/Hero';
import EventsDisplay from '@/components/EventsDisplay';

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
      <EventsDisplay events={events} searchQuery={search} />
    </div>
  );
}
