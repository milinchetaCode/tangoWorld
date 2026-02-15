import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating organizer@example.com user status...');

    // Find the user first
    const existingUser = await prisma.user.findUnique({
        where: { email: 'organizer@example.com' },
    });

    if (!existingUser) {
        console.error('User organizer@example.com not found in database.');
        console.log('Please ensure the user exists before running this script.');
        process.exit(1);
    }

    console.log('Current user status:');
    console.log(`  - Role: ${existingUser.role}`);
    console.log(`  - Organizer Status: ${existingUser.organizerStatus}`);

    // Update the user to be an organizer
    const updatedUser = await prisma.user.update({
        where: { email: 'organizer@example.com' },
        data: {
            role: 'organizer',
            organizerStatus: 'approved',
        },
    });

    console.log('\n✅ User updated successfully!');
    console.log('New user status:');
    console.log(`  - Role: ${updatedUser.role}`);
    console.log(`  - Organizer Status: ${updatedUser.organizerStatus}`);
    console.log('\nThe user organizer@example.com can now create and manage events.');
}

main()
    .catch((e) => {
        console.error('Error updating user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
