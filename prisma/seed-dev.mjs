// Seeds a LOCAL development database with test users, drinks and achievements.
//
//   npm run db:seed-dev
//
// Refuses to run against anything but localhost. The database URL is passed to
// Prisma explicitly so the production URL in .env is never picked up.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DEV_DATABASE_URL ?? "postgresql://qpreiss@localhost:5432/drinkserver_dev";
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
    console.error(`Refusing to seed non-local database host "${host}".`);
    process.exit(1);
}

const db = new PrismaClient({ datasourceUrl: url });

const PASSWORD = "password123";

const users = [
    { name: "Test Admin", email: "admin@test.local", role: "ADMIN" },
    { name: "Test User", email: "user@test.local", role: "USER" },
    { name: "Second User", email: "user2@test.local", role: "USER" },
];

// Cards size themselves from the image; colors must be names used in drink-entry.tsx.
const items = [
    { itemname: "Club Mate", priceCents: 150, quantity: 20, sugar: 25, caffeine: 100, energy: 100, carbohydrate: 25, image: "/drinkImages/bgMioMio-Mate.png", color: "black", bgcolor: "orange" },
    { itemname: "Fritz Kola", priceCents: 180, quantity: 10, sugar: 33, caffeine: 83, energy: 200, carbohydrate: 34, image: "/drinkImages/bgFritz-Kola.png", color: "white", bgcolor: "schwarz" },
    // Stock of exactly one, for testing concurrent purchases of the last item.
    { itemname: "Last One", priceCents: 200, quantity: 1, sugar: 10, caffeine: 50, energy: 80, carbohydrate: 10, image: "/drinkImages/bgAfri-Cola.png", color: "white", bgcolor: "rot" },
];

const achievementNames = [
    "First Drink", "Night Owl", "Early Bird", "Weekend Warrior", "Thirsty", "Junkie",
    "Caffein Bomb", "Caffein Overdose", "Sugar Shock", "Regular", "Loyal", "Explorer",
    "Mate Mate Mate", "Fritz", "Frit", "Philanthropist", "Ahoj",
];

const main = async () => {
    const password = await bcrypt.hash(PASSWORD, 10);

    for (const user of users) {
        await db.user.upsert({
            where: { email: user.email },
            update: { ...user, password, authorized: true, emailVerified: new Date() },
            create: { ...user, password, authorized: true, emailVerified: new Date() },
        });
    }

    for (const item of items) {
        await db.item.upsert({ where: { itemname: item.itemname }, update: item, create: item });
    }

    for (const name of achievementNames) {
        await db.achievement.upsert({ where: { name }, update: {}, create: { name, description: name } });
    }

    console.log(`Seeded ${users.length} users (password "${PASSWORD}"), ${items.length} items, ${achievementNames.length} achievements.`);
    for (const user of users) {
        console.log(`  ${user.role.padEnd(5)} ${user.email}`);
    }
};

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
