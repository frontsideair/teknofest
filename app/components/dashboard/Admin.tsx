import {
  Anchor,
  Button,
  Container,
  List,
  ListItem,
  Text,
  Title,
} from "@mantine/core";
import { Link, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { getContests } from "~/models/contest.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = {
  contests: Awaited<ReturnType<typeof getContests>>;
};

export const loader = async () => {
  return { contests: await getContests() };
};

export default function AdminDashboard() {
  const { contests } = useLoaderData<Jsonify<LoaderData>>();

  return (
    <Container size="sm">
      <Title order={2}>Admin Dashboard</Title>
      <Button component={Link} to={route("/contest/new")}>
        Create new contest
      </Button>
      <Title order={3}>Contests</Title>
      <List>
        {contests.length ? (
          contests.map((contest) => (
            <ListItem key={contest.id}>
              <Anchor
                component={Link}
                to={route("/contest/:contestId", {
                  contestId: String(contest.id),
                })}
              >
                {contest.name}
              </Anchor>
            </ListItem>
          ))
        ) : (
          <Text>No contests found!</Text>
        )}
      </List>
    </Container>
  );
}
