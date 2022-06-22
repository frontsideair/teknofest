import { Anchor, Container, List, ListItem, Text, Title } from "@mantine/core";
import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import type { getJudgeContests } from "~/models/contest.server";

type Props = {
  contests: Awaited<ReturnType<typeof getJudgeContests>>;
};

export default function JudgeDashboard({ contests }: Props) {
  return (
    <Container size="sm">
      <Title order={2}>Judge Dashboard</Title>
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
