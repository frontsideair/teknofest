import { Container, Stack, Title } from "@mantine/core";
import type { Team } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { getTeam } from "~/models/team.server";

const numericString = z.string().regex(/^\d+$/).transform(Number);

export const loader: LoaderFunction = async ({ params }) => {
  const teamId = numericString.parse(params.teamId);
  const team = await getTeam(teamId);
  if (team) {
    return json(team);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function TeamPage() {
  const team = useLoaderData<Team>();
  return (
    <Container size="sm">
      <Title order={2}>Team {team.name}</Title>
      <Stack>{/* {team.members} */}</Stack>
    </Container>
  );
}
