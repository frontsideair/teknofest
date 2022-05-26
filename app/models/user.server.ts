import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export const fullNameSchema = z.string().min(1, "Full name is required");
export const roleSchema = z.enum(["advisor", "student"]);
export const emailSchema = z.string().email("Email is invalid");
export const passwordSchema = z.string().min(8, "Password is too short");

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  fullName: User["fullName"],
  email: User["email"],
  password: string,
  role: User["role"]
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const parsedRole = z.enum(["admin", "advisor", "student"]).parse(role);

  return prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: parsedRole,
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

export async function changeDetails(
  id: User["id"],
  fullName: User["fullName"]
) {
  return prisma.user.update({
    where: { id },
    data: { fullName },
  });
}
