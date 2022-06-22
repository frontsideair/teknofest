import {
  Anchor,
  Button,
  Card,
  Container,
  List,
  Text,
  Title,
} from "@mantine/core";
import { Link, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import {
  getAdvisorTeams,
  getContestWithApplicationsOpen,
} from "~/models/contest.server";
import type { User } from "~/models/user.server";
import { partition } from "~/utils/common";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = {
  teams: Awaited<ReturnType<typeof getAdvisorTeams>>;
  applicationsOpen: boolean;
};

export const loader = async (userId: User["id"]) => {
  const teams = await getAdvisorTeams(userId);
  const currentContest = await getContestWithApplicationsOpen();
  return { teams, applicationsOpen: Boolean(currentContest) };
};

export default function AdvisorDashboard() {
  const { teams, applicationsOpen } = useLoaderData<Jsonify<LoaderData>>();
  const now = new Date();
  const [[currentTeam], pastTeams] = partition(
    teams,
    (team) =>
      new Date(team.contest.applicationStart) <= now &&
      now < new Date(team.contest.finalRaceEnd)
  );

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
      ) : applicationsOpen ? (
        <Text>
          No team for the current contest.{" "}
          <Anchor component={Link} to={route("/team/new")}>
            Create new team?
          </Anchor>
        </Text>
      ) : (
        <Text>No team for current contest.</Text>
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
