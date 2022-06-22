import {
  Anchor,
  Button,
  Card,
  Container,
  List,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import type { getAdvisorContests } from "~/models/contest.server";

type Props = {
  contests: Awaited<ReturnType<typeof getAdvisorContests>>;
};

export default function AdvisorDashboard({ contests }: Props) {
  const [[currentContest], pastContests] = contests;
  const currentTeam = currentContest?.teams[0];
  const pastTeams = pastContests.map((contest) => contest.teams).flat();

  return (
    <Container size="sm">
      <Title order={2}>Advisor Dashboard</Title>
      <Title order={3}>Current Team</Title>
      {currentTeam ? (
        <Card component="article">
          <Title order={4}>{currentTeam.name}</Title>

          <Button
            component={Link}
            to={route("/team/:teamId", { teamId: String(currentTeam.id) })}
          >
            View team
          </Button>
        </Card>
      ) : (
        <Text>
          No team for the current contest.{" "}
          <Anchor component={Link} to={route("/team/new")}>
            Create new team?
          </Anchor>
        </Text>
      )}
      {pastTeams.length > 0 && (
        <>
          <Title order={3}>Past Teams</Title>
          <List>
            {pastTeams.map((team) => (
              <List.Item key={team.id}>
                <Anchor
                  component={Link}
                  to={route("/team/:teamId", { teamId: String(team.id) })}
                >
                  {team.name}
                </Anchor>
              </List.Item>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}
