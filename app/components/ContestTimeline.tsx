import { Text, Timeline } from "@mantine/core";
import type { Contest } from "@prisma/client";
import type { getTeam } from "~/models/team.server";
import { format } from "~/utils/date";
import type { Jsonify } from "~/utils/jsonify";
import ApplicationChecks from "./checks/Application";

type Props = {
  contest: Jsonify<Contest>;
  team?: Jsonify<NonNullable<Awaited<ReturnType<typeof getTeam>>>>;
};

export default function ContestTimeline({ contest, team }: Props) {
  const periods = [
    {
      key: "application",
      title: "Application and progress report",
      description:
        "Advisors can apply only during this period and progress reports must be submitted by the end of this period.",
      checks: team && <ApplicationChecks team={team} contest={contest} />,
      start: contest.applicationStart,
      end: contest.applicationEnd,
    },
    {
      key: "letters",
      title: "Letters of commitment and consent",
      description:
        "Letter of commitment and letters of contents (if necessary) must be uploaded in this period.",
      start: contest.letterUploadStart,
      end: contest.letterUploadEnd,
    },
    {
      key: "design",
      title: "Technical design report",
      description:
        "The technical design report and promotional material must be uploaded in this period.",
      start: contest.designReportStart,
      end: contest.designReportEnd,
    },
    {
      key: "technical-controls",
      title: "Technical controls",
      description: "The technical controls will be performed in this period.",
      start: contest.techControlsStart,
      end: contest.techControlsEnd,
    },
    {
      key: "final-race",
      title: "Final races",
      description: "Final races will be held during these dates.",
      start: contest.finalRaceStart,
      end: contest.finalRaceEnd,
    },
  ];

  const now = new Date();
  const activePeriodIndex = periods.findIndex(
    (period) => new Date(period.start) <= now && new Date(period.end) >= now
  );

  return (
    <Timeline active={activePeriodIndex}>
      {periods.map((period) => (
        <Timeline.Item key={period.key} title={period.title}>
          <Text color="dimmed" size="sm">
            {period.description}
            {period.checks}
          </Text>
          <Text size="xs">
            {format(new Date(period.start))} - {format(new Date(period.end))}
          </Text>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
