import { Box, Checkbox, Popover, Progress, Stack } from "@mantine/core";
import type { Contest, Team, TeamMember } from "@prisma/client";
import { useState } from "react";
import type { Jsonify } from "~/utils/jsonify";
import { teamSize } from "~/utils/team";

type Props = {
  team: Jsonify<Team & { members: TeamMember[] }>;
  contest: Jsonify<Contest>;
};

export function getChecks({ team, contest }: Props) {
  return [
    {
      key: "name",
      label: `Team name has correct length (between ${contest.minTeamNameLength} and ${contest.maxTeamNameLength})`,
      checked:
        team.name.length >= contest.minTeamNameLength &&
        team.name.length <= contest.maxTeamNameLength,
    },
    {
      key: "members",
      label: `Team has enough members (between ${contest.minTeamSize} and ${contest.maxTeamSize})`,
      checked:
        teamSize(team.members) >= contest.minTeamSize &&
        teamSize(team.members) <= contest.maxTeamSize,
    },
    {
      key: "report",
      label: "Uploaded progress report",
      checked: Boolean(team.progressReportPath),
    },
    {
      key: "captain",
      label: "Have a member with captain responsibility",
      checked: Boolean(team.members.some((member) => member.isCaptain)),
    },
    {
      key: "pilot",
      label: "Have a member with pilot responsibility",
      checked: Boolean(
        team.members.some((member) => member.pilotingResponsibility === "pilot")
      ),
    },
    {
      key: "copilot",
      label: "Have a member with copilot responsibility",
      checked: Boolean(
        team.members.some(
          (member) => member.pilotingResponsibility === "copilot"
        )
      ),
    },
  ];
}

export function Completion({ contest, team }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const checks = getChecks({ contest, team });

  return (
    <Popover
      opened={isOpen}
      onClose={() => setIsOpen(false)}
      position="bottom"
      withArrow
      target={
        <Box
          style={{ width: 100 }}
          py="xs"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Progress
            value={
              (checks.filter((check) => check.checked).length / checks.length) *
              100
            }
          />
        </Box>
      }
    >
      <Checks checks={checks} />
    </Popover>
  );
}

function Checks({ checks }: { checks: ReturnType<typeof getChecks> }) {
  return (
    <Stack my="sm">
      {checks.map((check) => (
        <Checkbox key={check.key} checked={check.checked} label={check.label} />
      ))}
    </Stack>
  );
}

export default function ApplicationChecks({ team, contest }: Props) {
  const checks = getChecks({ team, contest });

  return <Checks checks={checks} />;
}
