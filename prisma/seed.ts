import { createUser, deleteUserByEmail } from "~/models/user.server";

async function seed() {
  const email = "admin@teknofest.org";

  // cleanup the existing database
  await deleteUserByEmail(email).catch(() => {
    // no worries if it doesn't exist yet
  });

  await createUser("Admin", email, "teknofestadmin", "admin");

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await global.__db__.$disconnect();
  });
