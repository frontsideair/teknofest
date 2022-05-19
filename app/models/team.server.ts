import type { Team, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { getCurrentContest } from "./contest.server";

export async function getTeam(advisorId: User["id"], id: Team["id"]) {
  const maybeTeam = await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });

  if (maybeTeam?.advisorId === advisorId) {
    return maybeTeam;
  } else {
    return null;
  }
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
