import { Anchor, Button, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import type { getContests } from "~/models/contest.server";

type Props = {
  contests: Awaited<ReturnType<typeof getContests>>;
};

export default function AdminDashboard({ contests }: Props) {
  return (
    <Container size="sm">
      <Title order={2}>Admin Dashboard</Title>
      <Button component={Link} to={route("/contest/new")}>
        Create new contest
      </Button>
      <Title order={3}>Contests</Title>
      <Stack>
        {contests.length ? (
          contests.map((contest) => (
            <Anchor
              key={contest.id}
              component={Link}
              to={route("/contest/:contestId", {
                contestId: String(contest.id),
              })}
            >
              {contest.id}
            </Anchor>
          ))
        ) : (
          <Text>No contests found!</Text>
        )}
      </Stack>
    </Container>
  );
}
