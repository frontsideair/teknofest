import { Box, Container, Group, Title } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import Sidebar, { SidebarItem } from "~/components/Sidebar";
import { getTeam } from "~/models/team.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  if (team) {
    return json<LoaderData>({ team });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Team ${data?.team?.name}`,
  };
};

export default function TeamPage() {
  const { team } = useLoaderData<Jsonify<LoaderData>>();

  const links = [
    {
      to: route("/team/:teamId", { teamId: String(team.id) }),
      label: "Overview",
    },
    {
      to: route("/team/:teamId/members", { teamId: String(team.id) }),
      label: "Members",
    },
    {
      to: route("/team/:teamId/progress-report", { teamId: String(team.id) }),
      label: "Progress Report",
    },
    {
      to: route("/team/:teamId/settings", { teamId: String(team.id) }),
      label: "Settings",
    },
  ];

  return (
    <Container size="md">
      <Title order={2}>Team {team.name}</Title>
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
