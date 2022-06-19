import { Box, Container, Group, Title } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import Sidebar, { SidebarItem } from "~/components/Sidebar";
import { getContest } from "~/models/contest.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
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
  return {
    title: `Contest ${data.id}`,
  };
};

export default function ContestPage() {
  const contest = useLoaderData<Jsonify<LoaderData>>();

  const links = [
    {
      to: route("/contest/:contestId", { contestId: String(contest.id) }),
      label: "Overview",
    },
    {
      to: route("/contest/:contestId/teams", { contestId: String(contest.id) }),
      label: "Teams",
    },
    {
      to: route("/contest/:contestId/settings", {
        contestId: String(contest.id),
      }),
      label: "Settings",
    },
  ];

  return (
    <Container size="md">
      <Title order={2}>Contest {contest.id}</Title>
      <Group noWrap align="flex-start" mt="md">
        <Sidebar>
          {links.map((link, index) => (
            <SidebarItem key={index} link={link} />
          ))}
        </Sidebar>
        <Box style={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Group>
    </Container>
  );
}
