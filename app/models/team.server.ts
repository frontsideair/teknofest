import type { Team, TeamMember, User } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "~/db.server";
import { teamSize } from "~/utils/team";
import {
  ensureCurrentContest,
  getContestWithApplicationsOpen,
} from "./contest.server";

export const nameSchema = z.string().min(1, "Name is too short");
export const responsibilitySchema = z.enum(["captain", "pilot", "copilot"]);

export type Responsibility = z.infer<typeof responsibilitySchema>;

export async function getTeam(id: Team["id"]) {
  return await prisma.team.findUnique({
    where: { id },
    include: { members: { include: { user: true } }, contest: true },
  });
}

async function ensureTeam(id: Team["id"]) {
  const team = await getTeam(id);
  if (!team) {
    throw new Error(`Team ${id} not found`);
  } else {
    return team;
  }
}

export async function getTeams(memberId: User["id"]) {
  return await prisma.team.findMany({
    where: { members: { some: { userId: memberId } } },
  });
}

export async function getTeamByInvite(inviteCode: Team["inviteCode"]) {
  return await prisma.team.findUnique({
    where: { inviteCode },
    include: {
      members: { include: { user: true } },
      contest: { select: { maxTeamSize: true } },
    },
  });
}

type TeamWithMembers = NonNullable<Awaited<ReturnType<typeof getTeamByInvite>>>;

export function ensureCanJoinTeam(user: User, team: TeamWithMembers) {
  // user is advisor of team
  const isAdvisorOfTeam = user.id === team.advisorId;
  // user is already member of team
  const isMemberOfTeam = team.members.some(({ userId }) => userId === user.id);
  // team has no open slots (include advisor)
  const teamIsFull = teamSize(team.members) >= team.contest.maxTeamSize;
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
    return null;
  } else {
    throw new Error("You cannot join this team");
  }
}

export async function joinTeam(user: User, team: TeamWithMembers) {
  ensureCanJoinTeam(user, team);
  await ensureCurrentContest(team.contestId);
  return await prisma.teamMember.create({
    data: { userId: user.id, teamId: team.id },
  });
}

export async function removeFromTeam(userId: User["id"], teamId: Team["id"]) {
  const team = await ensureTeam(teamId);
  await ensureCurrentContest(team.contestId);
  return await prisma.teamMember.delete({
    where: { teamId_userId: { teamId, userId } },
  });
}

function hasPilotingResponsibility(
  teamMember: TeamMember,
  pilotingResponsibility: "pilot" | "copilot"
) {
  return teamMember.pilotingResponsibility === pilotingResponsibility;
}

async function assignPilotingResponsibility(
  team: TeamWithMembers,
  userId: User["id"],
  pilotingResponsibility: "pilot" | "copilot"
) {
  const old = team.members.find((member) =>
    hasPilotingResponsibility(member, pilotingResponsibility)
  );
  if (old) {
    await prisma.teamMember.update({
      where: {
        teamId_userId: { teamId: team.id, userId: old.userId },
      },
      data: { pilotingResponsibility: null },
    });
  }
  return await prisma.teamMember.update({
    where: { teamId_userId: { teamId: team.id, userId } },
    data: { pilotingResponsibility },
  });
}

export async function assignResponsibility(
  userId: User["id"],
  teamId: Team["id"],
  responsibility: z.infer<typeof responsibilitySchema>
) {
  const team = await getTeam(teamId);
  if (team) {
    await ensureCurrentContest(team.contestId);
    switch (responsibility) {
      case "captain": {
        if (team.advisorId === userId) {
          throw new Error("Advisor cannot be captain");
        }
        const oldCaptain = team.members.find((member) => member.isCaptain);
        if (oldCaptain) {
          await prisma.teamMember.update({
            where: {
              teamId_userId: { teamId, userId: oldCaptain.userId },
            },
            data: { isCaptain: false },
          });
        }
        return await prisma.teamMember.update({
          where: { teamId_userId: { teamId, userId } },
          data: { isCaptain: true },
        });
      }
      case "pilot": {
        if (team.advisorId === userId) {
          throw new Error("Advisor cannot be pilot");
        }
        return await assignPilotingResponsibility(team, userId, responsibility);
      }
      case "copilot": {
        return await assignPilotingResponsibility(team, userId, responsibility);
      }
    }
  } else {
    throw new Error("Team does not exist");
  }
}

export async function regenerateInviteCode(teamId: Team["id"]) {
  const team = await ensureTeam(teamId);
  await ensureCurrentContest(team.contestId);
  return await prisma.team.update({
    where: { id: teamId },
    data: { inviteCode: randomUUID() },
  });
}

export async function setProgressReportPath(
  teamId: Team["id"],
  progressReportPath: string
) {
  const team = await ensureTeam(teamId);
  await ensureCurrentContest(team.contestId);
  await prisma.team.update({
    where: { id: teamId },
    data: { progressReportPath },
  });
}

export async function createTeam(
  name: Team["name"],
  advisorId: Team["advisorId"]
) {
  const currentContest = await getContestWithApplicationsOpen();

  if (currentContest) {
    return prisma.team.create({
      data: {
        advisorId,
        contestId: currentContest.id,
        name,
      },
    });
  } else {
    throw new Error("No open contest found");
  }
}

export async function updateTeam(id: Team["id"], name: Team["name"]) {
  const team = await ensureTeam(id);
  await ensureCurrentContest(team.contestId);
  return await prisma.team.update({
    where: { id },
    data: { name },
  });
}

export async function deleteTeam(teamId: Team["id"]) {
  return await prisma.team.delete({
    where: {
      id: teamId,
    },
  });
}
