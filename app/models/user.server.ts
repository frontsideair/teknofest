import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  password: string,
  role: User["role"]
) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: User["passwordHash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
  });

  const isValid = await bcrypt.compare(
    password,
    userWithPassword?.passwordHash ?? "prevent-timing-attack"
  );

  if (!userWithPassword || !isValid) {
    return null;
  }

  const { passwordHash: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function changeEmail(
  id: User["id"],
  newEmail: User["email"],
  password: string
) {
  const user = await prisma.user.findUnique({ where: { id } });

  const isValid = await bcrypt.compare(
    password,
    user?.passwordHash ?? "whatever"
  );

  if (!isValid) {
    throw new Error("Invalid password");
  }

  return prisma.user.update({
    where: { id },
    data: { email: newEmail },
  });
}

export async function changePassword(
  id: User["id"],
  oldPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id } });

  const isValid = await bcrypt.compare(
    oldPassword,
    user?.passwordHash ?? "whatever"
  );

  if (!isValid) {
    throw new Error("Invalid password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}
