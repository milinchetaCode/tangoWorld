import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating test data for organizer@example.com...\n');

    // Check if organizer exists
    const organizer = await prisma.user.findUnique({
        where: { email: 'organizer@example.com' },
    });

    if (!organizer) {
        console.error('❌ ERROR: organizer@example.com does not exist!');
        console.error('Please ensure the organizer account exists before running this script.');
        process.exit(1);
    }

    if (organizer.organizerStatus !== 'approved') {
        console.error('❌ ERROR: organizer@example.com is not approved!');
        console.error(`Current organizer status: ${organizer.organizerStatus}`);
        console.error('Please approve the organizer before running this script.');
        process.exit(1);
    }

    console.log(`✅ Found organizer: ${organizer.name} ${organizer.surname} (${organizer.email})\n`);

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    console.log('👥 Creating test users...');

    const testUsers = [];

    const user1 = await prisma.user.upsert({
        where: { email: 'alice.dancer@test.com' },
        update: {},
        create: {
            email: 'alice.dancer@test.com',
            passwordHash,
            name: 'Alice',
            surname: 'Dancer',
            city: 'Barcelona',
            gender: 'female',
            role: 'user',
            dietaryNeeds: 'Vegetarian',
        },
    });
    testUsers.push(user1);
    console.log(`   ✓ Created ${user1.name} ${user1.surname} (${user1.email})`);

    const user2 = await prisma.user.upsert({
        where: { email: 'bob.leader@test.com' },
        update: {},
        create: {
            email: 'bob.leader@test.com',
            passwordHash,
            name: 'Bob',
            surname: 'Leader',
            city: 'Madrid',
            gender: 'male',
            role: 'user',
        },
    });
    testUsers.push(user2);
    console.log(`   ✓ Created ${user2.name} ${user2.surname} (${user2.email})`);

    const user3 = await prisma.user.upsert({
        where: { email: 'charlie.swing@test.com' },
        update: {},
        create: {
            email: 'charlie.swing@test.com',
            passwordHash,
            name: 'Charlie',
            surname: 'Swing',
            city: 'Valencia',
            gender: 'male',
            role: 'user',
            dietaryNeeds: 'Gluten-free',
        },
    });
    testUsers.push(user3);
    console.log(`   ✓ Created ${user3.name} ${user3.surname} (${user3.email})`);

    const user4 = await prisma.user.upsert({
        where: { email: 'diana.follower@test.com' },
        update: {},
        create: {
            email: 'diana.follower@test.com',
            passwordHash,
            name: 'Diana',
            surname: 'Follower',
            city: 'Seville',
            gender: 'female',
            role: 'user',
        },
    });
    testUsers.push(user4);
    console.log(`   ✓ Created ${user4.name} ${user4.surname} (${user4.email})`);

    const user5 = await prisma.user.upsert({
        where: { email: 'edward.tango@test.com' },
        update: {},
        create: {
            email: 'edward.tango@test.com',
            passwordHash,
            name: 'Edward',
            surname: 'Tango',
            city: 'Bilbao',
            gender: 'male',
            role: 'user',
            dietaryNeeds: 'Vegan',
        },
    });
    testUsers.push(user5);
    console.log(`   ✓ Created ${user5.name} ${user5.surname} (${user5.email})\n`);

    // Create test events
    console.log('📅 Creating test events...');

    const event1 = await prisma.event.create({
        data: {
            title: 'Mediterranean Tango Festival',
            startDate: new Date('2026-06-12T18:00:00Z'),
            endDate: new Date('2026-06-14T23:00:00Z'),
            location: 'Barcelona, Spain',
            latitude: 41.3851,
            longitude: 2.1734,
            venue: 'Casa del Tango',
            capacity: 120,
            maleCapacity: 60,
            femaleCapacity: 60,
            organizerId: organizer.id,
            status: 'published',
            isPublished: true,
            schedule: 'Friday evening milonga, Saturday workshops and milonga, Sunday grand milonga.',
            guests: 'Pablo Veron, Noelia Hurtado',
            djs: 'DJ Carlos Martinez, DJ Sofia Torres',
            imageUrl: 'https://images.unsplash.com/photo-1545912452-8b5d0e0164f4?q=80&w=1000&auto=format&fit=crop',
            priceFullEventNoFoodNoAccommodation: 150.00,
            priceFullEventFood: 220.00,
            priceFullEventAccommodation: 280.00,
            priceFullEventBoth: 350.00,
            priceDailyFood: 80.00,
            priceDailyNoFood: 55.00,
            faq: 'Q: Is parking available? A: Yes, free parking nearby.\nQ: What level is required? A: Intermediate to advanced.',
            contact: 'For questions: barcelona@tango.com or +34 123 456 789',
        },
    });
    console.log(`   ✓ Created event: ${event1.title}`);

    const event2 = await prisma.event.create({
        data: {
            title: 'Summer Milonga Nights',
            startDate: new Date('2026-07-20T20:00:00Z'),
            endDate: new Date('2026-07-22T02:00:00Z'),
            location: 'Valencia, Spain',
            latitude: 39.4699,
            longitude: -0.3763,
            venue: 'Teatro Principal',
            capacity: 80,
            maleCapacity: 40,
            femaleCapacity: 40,
            organizerId: organizer.id,
            status: 'published',
            isPublished: true,
            schedule: 'Late night milongas under the stars.',
            guests: 'Gustavo Naveira, Giselle Anne',
            djs: 'DJ Roberto Luna',
            imageUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1000&auto=format&fit=crop',
            priceFullEventNoFoodNoAccommodation: 90.00,
            priceFullEventFood: 140.00,
            priceFullEventAccommodation: 180.00,
            priceFullEventBoth: 230.00,
            priceDailyFood: 50.00,
            priceDailyNoFood: 35.00,
            faq: 'Q: Dress code? A: Smart casual, comfortable shoes.\nQ: Can I come alone? A: Absolutely!',
            contact: 'Contact us: valencia@tango.com',
        },
    });
    console.log(`   ✓ Created event: ${event2.title}\n`);

    // Create applications with different statuses
    console.log('📝 Creating test applications with various statuses...');

    // Event 1 applications
    await prisma.application.create({
        data: {
            userId: user1.id,
            eventId: event1.id,
            status: 'accepted',
            paymentDone: true,
            pricingOption: 'full_both',
            totalPrice: 350.00,
        },
    });
    console.log(`   ✓ ${user1.name} ${user1.surname} -> ${event1.title} [ACCEPTED, PAID]`);

    await prisma.application.create({
        data: {
            userId: user2.id,
            eventId: event1.id,
            status: 'accepted',
            paymentDone: false,
            pricingOption: 'full_no_food_no_accommodation',
            totalPrice: 150.00,
        },
    });
    console.log(`   ✓ ${user2.name} ${user2.surname} -> ${event1.title} [ACCEPTED, NOT PAID]`);

    await prisma.application.create({
        data: {
            userId: user3.id,
            eventId: event1.id,
            status: 'applied',
            paymentDone: false,
            pricingOption: 'full_food',
            totalPrice: 220.00,
        },
    });
    console.log(`   ✓ ${user3.name} ${user3.surname} -> ${event1.title} [APPLIED]`);

    await prisma.application.create({
        data: {
            userId: user4.id,
            eventId: event1.id,
            status: 'waitlisted',
            paymentDone: false,
            pricingOption: 'daily_food',
            numberOfDays: 2,
            totalPrice: 160.00,
        },
    });
    console.log(`   ✓ ${user4.name} ${user4.surname} -> ${event1.title} [WAITLISTED]`);

    await prisma.application.create({
        data: {
            userId: user5.id,
            eventId: event1.id,
            status: 'rejected',
            paymentDone: false,
            pricingOption: 'daily_no_food',
            numberOfDays: 3,
            totalPrice: 165.00,
        },
    });
    console.log(`   ✓ ${user5.name} ${user5.surname} -> ${event1.title} [REJECTED]`);

    // Event 2 applications
    await prisma.application.create({
        data: {
            userId: user1.id,
            eventId: event2.id,
            status: 'applied',
            paymentDone: false,
            pricingOption: 'full_no_food_no_accommodation',
            totalPrice: 90.00,
        },
    });
    console.log(`   ✓ ${user1.name} ${user1.surname} -> ${event2.title} [APPLIED]`);

    await prisma.application.create({
        data: {
            userId: user3.id,
            eventId: event2.id,
            status: 'cancelled',
            paymentDone: false,
            pricingOption: 'daily_food',
            numberOfDays: 2,
            totalPrice: 100.00,
        },
    });
    console.log(`   ✓ ${user3.name} ${user3.surname} -> ${event2.title} [CANCELLED]`);

    await prisma.application.create({
        data: {
            userId: user5.id,
            eventId: event2.id,
            status: 'accepted',
            paymentDone: true,
            pricingOption: 'full_food',
            totalPrice: 140.00,
        },
    });
    console.log(`   ✓ ${user5.name} ${user5.surname} -> ${event2.title} [ACCEPTED, PAID]`);

    console.log('\n✅ Test data created successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 5 test users created');
    console.log('   - 2 paid events created for organizer@example.com with different pricing offers:');
    console.log('     • Mediterranean Tango Festival: €150-€350 (premium pricing)');
    console.log('     • Summer Milonga Nights: €90-€230 (budget-friendly pricing)');
    console.log('   - 8 applications created with various statuses:');
    console.log('     • Accepted (paid): 2');
    console.log('     • Accepted (not paid): 1');
    console.log('     • Applied: 2');
    console.log('     • Waitlisted: 1');
    console.log('     • Rejected: 1');
    console.log('     • Cancelled: 1');
    console.log('\n📝 Test user credentials:');
    console.log('   Email: alice.dancer@test.com, bob.leader@test.com, etc.');
    console.log('   Password: password123 (for all test users)\n');
}

main()
    .catch((e) => {
        console.error('\n❌ Error:', e.message);
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
