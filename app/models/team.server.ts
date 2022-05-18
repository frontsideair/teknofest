import type { Team } from "@prisma/client";
import { prisma } from "~/db.server";
import { getCurrentContest } from "./contest.server";

export async function getTeam(id: Team["id"]) {
  return prisma.team.findUnique({ where: { id } });
}

export async function createTeam(
  name: Team["name"],
  advisorId: Team["advisorId"]
) {
  const currentContest = await getCurrentContest();

  if (currentContest) {
    return prisma.team.create({
      data: {
        advisorId,
        contestId: currentContest.id,
        name,
      },
    });
  } else {
    throw new Error("No contest found");
  }
}
