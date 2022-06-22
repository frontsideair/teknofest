import { Anchor, Container, List, ListItem, Text, Title } from "@mantine/core";
import type { User } from "~/models/user.server";
import { Link, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { getJudgeContests } from "~/models/contest.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = {
  contests: Awaited<ReturnType<typeof getJudgeContests>>;
};

export const loader = async (userId: User["id"]) => {
  return { contests: await getJudgeContests(userId) };
};

export default function JudgeDashboard() {
  const { contests } = useLoaderData<Jsonify<LoaderData>>();

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
