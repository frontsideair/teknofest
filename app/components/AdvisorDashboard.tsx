import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import type { getAdvisorContests } from "~/models/contest.server";

type Props = {
  contests: Awaited<ReturnType<typeof getAdvisorContests>>;
};

export default function AdvisorDashboard({ contests }: Props) {
  const [[currentContest], pastContests] = contests;
  const currentTeam = currentContest?.teams[0];

  return (
    <Container size="sm">
      <Title order={2}>Advisor Dashboard</Title>
      <Title order={3}>Current Team</Title>
      {currentTeam ? (
        <Card>
          <Title order={4}>{currentTeam.name}</Title>

          <Button
            component={Link}
            to={route("/team/:teamId", { teamId: String(currentTeam.id) })}
          >
            Edit team
          </Button>
        </Card>
      ) : (
        <Card>
          <Text>No team for current contest.</Text>
          <Button component={Link} to={route("/team/new")}>
            Create new team
          </Button>
        </Card>
      )}
      <Title order={3}>Past Teams</Title>
      <Stack>
        {pastContests
          .map((contest) => contest.teams)
          .flat()
          .map((team) => team.name)}
      </Stack>
    </Container>
  );
}
