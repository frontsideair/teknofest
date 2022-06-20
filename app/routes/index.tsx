import { Container, Group, Text, Title } from "@mantine/core";
import type { Contest } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import ContestTimeline from "~/components/ContestTimeline";
import { getCurrentContest } from "~/models/contest.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = Contest | null;

export const loader: LoaderFunction = async () => {
  const contest = await getCurrentContest();
  return json<LoaderData>(contest);
};

export default function Index() {
  const contest = useLoaderData<Jsonify<LoaderData>>();
  return (
    <Container size="sm">
      <Title order={2}>Current contest</Title>
      <Group mt="sm">
        {contest ? (
          <ContestTimeline contest={contest} />
        ) : (
          <Text>No active contest, check back later!</Text>
        )}
      </Group>
    </Container>
  );
}
