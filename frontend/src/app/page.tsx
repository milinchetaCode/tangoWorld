import Hero from '@/components/Hero';
import EventsDisplay from '@/components/EventsDisplay';

import { getApiUrl } from '@/lib/api';

async function getEvents() {
  try {
    const apiUrl = getApiUrl('/events');
    const res = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();

  return (
    <div>
      <Hero />
      <EventsDisplay events={events} />
    </div>
  );
}
