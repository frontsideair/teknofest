import type { User } from "@prisma/client";
import partition from "utils/partition";
import { prisma } from "~/db.server";

export async function getCurrentContest() {
  // TODO: find the contest where applications are open
  return await prisma.contest.findFirst({
    select: { id: true },
    orderBy: { createdAt: "desc" },
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
