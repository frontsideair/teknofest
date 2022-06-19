import type { Contest, User } from "@prisma/client";
import { partition } from "~/utils/common";
import { prisma } from "~/db.server";
import type { DateRange } from "~/utils/date";

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
    include: { teams: { include: { advisor: true } } },
  });
}

export async function createContest(
  application: DateRange,
  letterUpload: DateRange,
  designReport: DateRange,
  techControls: DateRange,
  finalRace: DateRange
) {
  return await prisma.contest.create({
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
