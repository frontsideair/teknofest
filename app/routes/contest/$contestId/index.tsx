import { Stack, Title } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import ContestTimeline from "~/components/ContestTimeline";
import { getContest } from "~/models/contest.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = NonNullable<Awaited<ReturnType<typeof getContest>>>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "judge");
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>(contest);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function Overview() {
  const contest = useLoaderData<Jsonify<LoaderData>>();

  return (
    <Stack>
      <Title order={3}>Overview</Title>
      <ContestTimeline contest={contest} />
    </Stack>
  );
}
