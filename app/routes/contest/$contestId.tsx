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

type LoaderData = {
  contest: NonNullable<Awaited<ReturnType<typeof getContest>>>;
  userRole: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  const user = await requireRole(request, "judge");
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>({ userRole: user.role, contest });
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Contest ${data?.contest?.name}`,
  };
};

export default function ContestPage() {
  const { contest, userRole } = useLoaderData<Jsonify<LoaderData>>();

  const links = [
    {
      to: route("/contest/:contestId", { contestId: String(contest.id) }),
      label: "Overview",
      adminOnly: false,
    },
    {
      to: route("/contest/:contestId/teams", { contestId: String(contest.id) }),
      label: "Teams",
      adminOnly: false,
    },
    {
      to: route("/contest/:contestId/judges", {
        contestId: String(contest.id),
      }),
      label: "Judges",
      adminOnly: true,
    },
    {
      to: route("/contest/:contestId/settings", {
        contestId: String(contest.id),
      }),
      label: "Settings",
      adminOnly: true,
    },
  ].filter((link) => userRole === "admin" || !link.adminOnly);

  return (
    <Container size="md">
      <Title order={2}>{contest.name}</Title>
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
