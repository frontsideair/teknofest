import type { Contest, User } from "@prisma/client";
import { prisma } from "~/db.server";
import type { DateRange } from "~/utils/date";
import { z } from "zod";
import { randomUUID } from "node:crypto";

export const nameSchema = z.string().min(1, "Name is required");

export async function getContestWithApplicationsOpen() {
  const now = new Date();
  return await prisma.contest.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      applicationStart: { lte: now },
      applicationEnd: { gte: now },
    },
  });
}

export async function getContestByInvite(inviteCode: Contest["inviteCode"]) {
  return await prisma.contest.findUnique({
    where: { inviteCode },
    include: { judges: { include: { user: true } } },
  });
}

export async function regenerateInviteCode(contestId: Contest["id"]) {
  return await prisma.contest.update({
    where: { id: contestId },
    data: { inviteCode: randomUUID() },
  });
}

export async function addJudgeToContest(
  userId: User["id"],
  contestId: Contest["id"]
) {
  return await prisma.contestJudge.create({
    data: {
      userId,
      contestId,
    },
  });
}

export async function removeJudgeFromContest(
  userId: User["id"],
  contestId: Contest["id"]
) {
  return await prisma.contestJudge.delete({
    where: {
      contestId_userId: {
        contestId,
        userId,
      },
    },
  });
}

export async function getCurrentContest() {
  const now = new Date();
  return await prisma.contest.findFirst({
    orderBy: { createdAt: "desc" },
    where: {
      applicationStart: { lte: now },
      finalRaceEnd: { gte: now },
    },
  });
}

export async function isCurrentContest(contestId: Contest["id"]) {
  const currentContest = await getCurrentContest();
  return contestId === currentContest?.id;
}

export async function ensureCurrentContest(contestId: Contest["id"]) {
  if (!(await isCurrentContest(contestId))) {
    throw new Error("Contest is not current");
  }
}

export async function getContests() {
  return await prisma.contest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getJudgeContests(judgeId: User["id"]) {
  return await prisma.contest.findMany({
    orderBy: { createdAt: "desc" },
    where: { judges: { some: { userId: judgeId } } },
  });
}

export async function getContest(id: Contest["id"]) {
  return await prisma.contest.findUnique({
    where: { id },
    include: {
      teams: { include: { advisor: true } },
      judges: { include: { user: true } },
    },
  });
}

type Range = [number, number];

export async function createContest(
  name: string,
  [minTeamSize, maxTeamSize]: Range,
  [minTeamNameLength, maxTeamNameLength]: Range,
  application: DateRange,
  letterUpload: DateRange,
  designReport: DateRange,
  techControls: DateRange,
  finalRace: DateRange
) {
  return await prisma.contest.create({
    data: {
      name,
      minTeamSize,
      maxTeamSize,
      minTeamNameLength,
      maxTeamNameLength,
      applicationStart: application.start,
      applicationEnd: application.end,
      letterUploadStart: letterUpload.start,
      letterUploadEnd: letterUpload.end,
      designReportStart: designReport.start,
      designReportEnd: designReport.end,
      techControlsStart: techControls.start,
      techControlsEnd: techControls.end,
      finalRaceStart: finalRace.start,
      finalRaceEnd: finalRace.end,
    },
  });
}

export async function updateContest(
  id: Contest["id"],
  name: string,
  [minTeamSize, maxTeamSize]: Range,
  [minTeamNameLength, maxTeamNameLength]: Range,
  application: DateRange,
  letterUpload: DateRange,
  designReport: DateRange,
  techControls: DateRange,
  finalRace: DateRange
) {
  return await prisma.contest.update({
    where: { id },
    data: {
      name,
      minTeamSize,
      maxTeamSize,
      minTeamNameLength,
      maxTeamNameLength,
      applicationStart: application.start,
      applicationEnd: application.end,
      letterUploadStart: letterUpload.start,
      letterUploadEnd: letterUpload.end,
      designReportStart: designReport.start,
      designReportEnd: designReport.end,
      techControlsStart: techControls.start,
      techControlsEnd: techControls.end,
      finalRaceStart: finalRace.start,
      finalRaceEnd: finalRace.end,
    },
  });
}

export async function getAdvisorTeams(advisorId: User["id"]) {
  return await prisma.team.findMany({
    where: { advisorId },
    include: {
      contest: { select: { applicationStart: true, finalRaceEnd: true } },
    },
  });
}
