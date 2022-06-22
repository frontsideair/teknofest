import { Stack, Title } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import ContestTimeline from "~/components/ContestTimeline";
import { getTeam } from "~/models/team.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = { team: NonNullable<Awaited<ReturnType<typeof getTeam>>> };

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  if (team) {
    return json<LoaderData>({ team });
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function Overview() {
  const { team } = useLoaderData<Jsonify<LoaderData>>();
  return (
    <Stack>
      <Title order={3}>Overview</Title>
      <ContestTimeline contest={team.contest} team={team} />
    </Stack>
  );
}
