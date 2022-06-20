import type { Contest, User } from "@prisma/client";
import { partition } from "~/utils/common";
import { prisma } from "~/db.server";
import type { DateRange } from "~/utils/date";
import { z } from "zod";

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

export async function getContest(id: Contest["id"]) {
  return await prisma.contest.findUnique({
    where: { id },
    include: { teams: { include: { advisor: true } } },
  });
}

export async function createContest(
  name: string,
  application: DateRange,
  letterUpload: DateRange,
  designReport: DateRange,
  techControls: DateRange,
  finalRace: DateRange
) {
  return await prisma.contest.create({
    data: {
      name: name,
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
  application: DateRange,
  letterUpload: DateRange,
  designReport: DateRange,
  techControls: DateRange,
  finalRace: DateRange
) {
  return await prisma.contest.update({
    where: { id },
    data: {
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

export async function getAdvisorContests(advisorId: User["id"]) {
  const currentContest = await getCurrentContest();
  const contests = await prisma.contest.findMany({
    where: { teams: { some: { advisorId } } },
    include: { teams: true },
  });

  return partition(contests, (contest) => contest.id === currentContest?.id);
}
