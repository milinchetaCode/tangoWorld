import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // SAFETY CHECK: Prevent seed from running in production
    // Check 1: NODE_ENV must not be production
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ ERROR: Cannot run seed script in production environment!');
        console.error('This script deletes all events and applications.');
        console.error('Set NODE_ENV to "development" or remove it to run seed script.');
        process.exit(1);
    }

    // Check 2: Detect production database URLs (Render, Heroku, AWS RDS, etc.)
    // Extract hostname from DATABASE_URL to avoid checking credentials
    const databaseUrl = process.env.DATABASE_URL || '';
    let hostname = '';
    
    try {
        // Parse the URL to extract only the hostname
        // PostgreSQL URLs format: postgresql://user:password@hostname:port/database
        const url = new URL(databaseUrl);
        hostname = url.hostname.toLowerCase();
    } catch (error) {
        // If URL parsing fails, the DATABASE_URL is likely malformed or missing
        // Exit with error - don't proceed with an invalid database URL
        if (databaseUrl) {
            console.error('❌ ERROR: Invalid DATABASE_URL format!');
            console.error('Cannot parse database URL. Please check your DATABASE_URL configuration.');
            process.exit(1);
        }
        // If DATABASE_URL is empty, hostname remains empty (likely development without DB)
    }

    const productionIndicators = [
        'render.com',
        'amazonaws.com',  // Covers *.amazonaws.com including *.rds.amazonaws.com
        'herokuapp.com',  // Covers *.herokuapp.com
    ];
    
    const isProductionDatabase = productionIndicators.some(indicator => 
        hostname.includes(indicator)
    );

    if (isProductionDatabase) {
        console.error('❌ ERROR: Cannot run seed script with production database!');
        console.error('This script deletes all events and applications.');
        console.error('Production database URL detected. Use a local/development database.');
        console.error('Database URL hostname matches known production hosting platforms.');
        process.exit(1);
    }

    console.log('🌱 Running database seed script...');
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'not set'}`);
    console.log('⚠️  WARNING: This will delete all existing events and applications!');

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
            organizerStatus: 'approved',
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

    const user3 = await prisma.user.upsert({
        where: { email: 'mike@example.com' },
        update: {},
        create: {
            email: 'mike@example.com',
            passwordHash,
            name: 'Mike',
            surname: 'Leader',
            city: 'London',
            gender: 'male',
            role: 'user',
        },
    });

    // Clear existing events and applications to avoid duplicates
    await prisma.application.deleteMany();
    await prisma.event.deleteMany();

    // Events - Create past events and current events for testing
    const pastEvent1 = await prisma.event.create({
        data: {
            title: 'Past Berlin Marathon 2025',
            startDate: new Date('2025-05-15T20:00:00Z'),
            endDate: new Date('2025-05-17T23:00:00Z'),
            location: 'Berlin, Germany',
            venue: 'Tango Kollektiv',
            capacity: 200,
            maleCapacity: 100,
            femaleCapacity: 100,
            organizerId: user1.id,
            status: 'published',
            schedule: 'Friday 20:00 - Sunday 23:00.',
            guests: 'World-renowned maestros from Buenos Aires.',
            djs: 'DJ Horacio, DJ Maria',
            imageUrl: 'https://images.unsplash.com/photo-1545912458-8ff30a6c71c4?q=80&w=1000&auto=format&fit=crop',
        },
    });

    const pastEvent2 = await prisma.event.create({
        data: {
            title: 'Paris Winter Festival 2025',
            startDate: new Date('2025-12-10T18:00:00Z'),
            endDate: new Date('2025-12-12T22:00:00Z'),
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

    // Applications - Create history of past accepted events for user2 (Jane)
    // Past events
    await prisma.application.create({
        data: {
            userId: user2.id,
            eventId: pastEvent1.id,
            status: 'accepted',
        },
    });

    await prisma.application.create({
        data: {
            userId: user2.id,
            eventId: pastEvent2.id,
            status: 'accepted',
        },
    });

    // Current event applications
    await prisma.application.create({
        data: {
            userId: user2.id,
            eventId: event1.id,
            status: 'accepted',
        },
    });

    await prisma.application.create({
        data: {
            userId: user3.id,
            eventId: event1.id,
            status: 'applied',
        },
    });

    console.log('✅ Seed data created successfully!');
    console.log('📊 Created:');
    console.log('   - 3 users (organizer@example.com, user@example.com, mike@example.com)');
    console.log('   - 5 events (2 past, 3 future)');
    console.log('   - 4 applications (Jane has 2 past accepted events + 1 current, Mike has 1 current)');
    console.log('   - Jane Dancer has participated in 2 past events by the same organizer');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
