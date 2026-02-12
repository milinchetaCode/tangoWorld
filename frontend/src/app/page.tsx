import Hero from '@/components/Hero';
import EventCard from '@/components/EventCard';
import { MOCK_EVENTS } from '@/lib/mock-data';

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-lg leading-8 text-slate-600">
              Handpicked tango events from around the world.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {MOCK_EVENTS.map((event) => (
              <EventCard
                key={event.id}
                {...event}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
