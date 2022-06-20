import { Container, Group, Title } from "@mantine/core";
import type { Contest } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import ContestTimeline from "~/components/ContestTimeline";
import { getCurrentContest } from "~/models/contest.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = Contest;

export const loader: LoaderFunction = async ({ request, params }) => {
  const contest = await getCurrentContest();
  if (contest) {
    return json<LoaderData>(contest);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function Index() {
  const contest = useLoaderData<Jsonify<LoaderData>>();
  return (
    <Container size="sm">
      <Title order={2}>Current contest</Title>
      <Group mt="sm">
        <ContestTimeline contest={contest} />
      </Group>
    </Container>
  );
}
