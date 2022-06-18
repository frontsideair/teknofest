import type { Contest, User } from "@prisma/client";
import { partition } from "~/utils/common";
import { prisma } from "~/db.server";

export async function getCurrentContest() {
  const now = new Date();
  return await prisma.contest.findFirst({
    select: { id: true },
    orderBy: { createdAt: "desc" },
    where: {
      applicationStart: { lte: now },
      applicationEnd: { gte: now },
    },
  });
}

export async function getContests() {
  return await prisma.contest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getContest(id: Contest["id"]) {
  return await prisma.contest.findUnique({
    where: { id },
  });
}

export async function createContest(
  applicationStart: Date,
  applicationEnd: Date
) {
  return await prisma.contest.create({
    data: {
      applicationStart,
      applicationEnd,
    },
  });
}

export async function getAdvisorContests(advisorId: User["id"]) {
  const currentContest = await getCurrentContest();
  const contests = await prisma.contest.findMany({
    where: { teams: { some: { advisorId } } },
    include: { teams: true },
  });

  return partition(contests, (contest) => contest.id === currentContest?.id);
}
