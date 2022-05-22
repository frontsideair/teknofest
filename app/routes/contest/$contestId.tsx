import { Container, Title } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getContest } from "~/models/contest.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

type LoaderData = NonNullable<Awaited<ReturnType<typeof getContest>>>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "admin");
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>(contest);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  console.log(data);
  return {
    title: `Contest ${data.id}`,
  };
};

export default function ContestPage() {
  const contest = useLoaderData<LoaderData>();
  return (
    <Container size="sm">
      <Title order={2}>Contest {contest.id}</Title>
    </Container>
  );
}
