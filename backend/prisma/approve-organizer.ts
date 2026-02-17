import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: npx ts-node prisma/approve-organizer.ts <email>');
        console.error('Example: npx ts-node prisma/approve-organizer.ts user@example.com');
        process.exit(1);
    }

    console.log(`\nApproving organizer request for: ${email}\n`);

    // Find the user first
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        console.error(`❌ User not found: ${email}`);
        console.log('\nMake sure the email is correct and the user exists in the database.');
        process.exit(1);
    }

    console.log('Current user status:');
    console.log('─────────────────────────────────────────');
    console.log(`  Name: ${existingUser.name} ${existingUser.surname}`);
    console.log(`  Role: ${existingUser.role}`);
    console.log(`  Organizer Status: ${existingUser.organizerStatus}`);
    console.log();

    // Check if user needs approval
    if (existingUser.organizerStatus === 'approved') {
        console.log('ℹ️  User is already approved as an organizer.');
        console.log();
        console.log('If user still cannot create events:');
        console.log('  1. User must log out and log back in to refresh JWT token');
        console.log('  2. Check browser localStorage has correct user data');
        console.log('  3. Clear browser cache and cookies');
        console.log();
        return;
    }

    if (existingUser.organizerStatus === 'none') {
        console.log('⚠️  Warning: User has not requested organizer status yet.');
        console.log();
        console.log('Proceeding anyway to approve user...');
        console.log();
    }

    // Update the user to be an approved organizer
    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            role: 'organizer',
            organizerStatus: 'approved',
        },
    });

    console.log('✅ User approved successfully!');
    console.log();
    console.log('New user status:');
    console.log('─────────────────────────────────────────');
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`  Organizer Status: ${updatedUser.organizerStatus}`);
    console.log();
    console.log('Next Steps:');
    console.log('─────────────────────────────────────────');
    console.log(`  1. Notify ${email} that they have been approved`);
    console.log('  2. User must log out and log back in to the application');
    console.log('  3. After login, the "Organizer" menu will appear');
    console.log('  4. User can now create and manage events');
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
