import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Users
    const user1 = await prisma.user.upsert({
        where: { email: 'organizer@example.com' },
        update: {},
        create: {
            email: 'organizer@example.com',
            passwordHash,
            name: 'John',
            surname: 'Organizer',
            city: 'Berlin',
            gender: 'male',
            role: 'organizer',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            passwordHash,
            name: 'Jane',
            surname: 'Dancer',
            city: 'Paris',
            gender: 'female',
            role: 'user',
        },
    });

    // Clear existing events and applications to avoid duplicates
    await prisma.application.deleteMany();
    await prisma.event.deleteMany();

    // Events
    const event1 = await prisma.event.create({
        data: {
            title: 'Berlin Tango Marathon',
            startDate: new Date('2026-05-15T20:00:00Z'),
            endDate: new Date('2026-05-17T23:00:00Z'),
            location: 'Berlin, Germany',
            venue: 'Tango Kollektiv',
            capacity: 200,
            maleCapacity: 100,
            femaleCapacity: 100,
            organizerId: user1.id,
            status: 'published',
            schedule: 'Friday 20:00 - Sunday 23:00. Non-stop dancing with breaks for workshops.',
            guests: 'World-renowned maestros from Buenos Aires.',
            djs: 'DJ Horacio, DJ Maria, DJ Francesco',
            imageUrl: 'https://images.unsplash.com/photo-1545912458-8ff30a6c71c4?q=80&w=1000&auto=format&fit=crop',
        },
    });

    const event2 = await prisma.event.create({
        data: {
            title: 'Paris Spring Festival',
            startDate: new Date('2026-04-10T18:00:00Z'),
            endDate: new Date('2026-04-12T22:00:00Z'),
            location: 'Paris, France',
            venue: 'Espace Oxygene',
            capacity: 150,
            maleCapacity: 75,
            femaleCapacity: 75,
            organizerId: user1.id,
            status: 'published',
            schedule: 'Workshops in the morning, Milongas in the evening.',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop',
        },
    });

    const event3 = await prisma.event.create({
        data: {
            title: 'Buenos Aires Tango Week',
            startDate: new Date('2026-08-20T10:00:00Z'),
            endDate: new Date('2026-08-27T23:00:00Z'),
            location: 'Buenos Aires, Argentina',
            venue: 'La Viruta',
            capacity: 500,
            maleCapacity: 250,
            femaleCapacity: 250,
            organizerId: user1.id,
            status: 'published',
            schedule: 'A full week of immersion in the heart of Tango.',
            imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=1000&auto=format&fit=crop',
        },
    });

    // Applications
    await prisma.application.create({
        data: {
            userId: user2.id,
            eventId: event1.id,
            status: 'accepted',
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
