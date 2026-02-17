import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: npx ts-node prisma/check-user-status.ts <email>');
        console.error('Example: npx ts-node prisma/check-user-status.ts user@example.com');
        process.exit(1);
    }

    console.log(`\nChecking status for: ${email}\n`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            surname: true,
            role: true,
            organizerStatus: true,
            createdAt: true,
        },
    });

    if (!user) {
        console.error(`❌ User not found: ${email}`);
        console.log('\nMake sure the email is correct and the user exists in the database.');
        process.exit(1);
    }

    console.log('User Information:');
    console.log('─────────────────────────────────────────');
    console.log(`  Name: ${user.name} ${user.surname}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Created: ${user.createdAt.toISOString()}`);
    console.log();
    console.log('Current Status:');
    console.log('─────────────────────────────────────────');
    console.log(`  Role: ${user.role}`);
    console.log(`  Organizer Status: ${user.organizerStatus}`);
    console.log();

    // Check if user can create events
    const canCreateEvents = user.organizerStatus === 'approved';
    
    if (canCreateEvents) {
        console.log('✅ This user CAN create events');
        console.log();
        console.log('If the user still cannot create events:');
        console.log('  1. User must log out and log back in to refresh JWT token');
        console.log('  2. Check browser localStorage has correct user data');
        console.log('  3. Check network requests show "Authorization: Bearer <token>"');
    } else {
        console.log('❌ This user CANNOT create events');
        console.log();
        console.log('Reason:');
        if (user.organizerStatus === 'pending') {
            console.log('  - Organizer status is "pending" (waiting for admin approval)');
            console.log();
            console.log('To approve this user, run:');
            console.log(`  npx ts-node prisma/approve-organizer.ts ${email}`);
        } else if (user.organizerStatus === 'none') {
            console.log('  - User has not requested organizer status yet');
            console.log();
            console.log('User needs to:');
            console.log('  1. Go to /profile page');
            console.log('  2. Click "Request Organizer Status" button');
            console.log('  3. Wait for admin approval');
        } else {
            console.log(`  - Organizer status is "${user.organizerStatus}" (unknown state)`);
        }
    }

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
