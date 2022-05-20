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

export async function getTeamByInvite(inviteCode: Team["inviteCode"]) {
  return await prisma.team.findUnique({
    where: { inviteCode },
    include: { members: { include: { user: true } } },
  });
}

type TeamWithMembers = NonNullable<Awaited<ReturnType<typeof getTeamByInvite>>>;

export function ensureCanJoinTeam(user: User, team: TeamWithMembers) {
  // user is advisor of team
  const isAdvisorOfTeam = user.id === team.advisorId;
  // user is already member of team
  const isMemberOfTeam = team.members.some(({ userId }) => userId === user.id);
  // team has no open slots
  const teamIsFull = team.members.length >= 15; // TODO: configurable
  // team has coadvisor slot
  const teamHasCoadvisorSlot = team.members.every(
    ({ user }) => user.role !== "advisor"
  );

  if (
    !isAdvisorOfTeam &&
    !isMemberOfTeam &&
    !teamIsFull &&
    ((user.role === "advisor" && teamHasCoadvisorSlot) ||
      user.role === "student")
  ) {
    throw new Response("You are not allowed to join", { status: 403 });
  } else {
    return null;
  }
}

export async function joinTeam(user: User, team: TeamWithMembers) {
  ensureCanJoinTeam(user, team);
  return await prisma.teamMember.create({
    data: { userId: user.id, teamId: team.id },
  });
}

export async function removeFromTeam(userId: User["id"], teamId: Team["id"]) {
  return await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  });
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
