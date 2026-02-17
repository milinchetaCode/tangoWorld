import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n📋 Listing all users waiting for organizer approval...\n');

    // Find all users with pending organizer status
    const pendingOrganizers = await prisma.user.findMany({
        where: {
            organizerStatus: 'pending',
        },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            city: true,
            role: true,
            organizerStatus: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    if (pendingOrganizers.length === 0) {
        console.log('✅ No users are waiting for organizer approval.');
        console.log();
        console.log('All pending organizer requests have been processed.');
        console.log();
        return;
    }

    console.log(`Found ${pendingOrganizers.length} user(s) waiting for approval:\n`);
    console.log('═════════════════════════════════════════════════════════════════');

    pendingOrganizers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name} ${user.surname}`);
        console.log('─────────────────────────────────────────────────────────────────');
        console.log(`   Email: ${user.email}`);
        console.log(`   City: ${user.city}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Request Date: ${user.createdAt.toISOString().split('T')[0]}`);
        console.log(`   Status: ${user.organizerStatus}`);
        console.log();
        console.log('   To approve this user, run:');
        console.log(`   npx ts-node prisma/approve-organizer.ts ${user.email}`);
        console.log();
    });

    console.log('═════════════════════════════════════════════════════════════════');
    console.log();
    console.log('Quick Commands:');
    console.log('─────────────────────────────────────────────────────────────────');
    console.log('Check specific user status:');
    console.log('  npx ts-node prisma/check-user-status.ts <email>');
    console.log();
    console.log('Approve a user:');
    console.log('  npx ts-node prisma/approve-organizer.ts <email>');
    console.log();
}

main()
    .catch((e) => {
        console.error('\n❌ Error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
