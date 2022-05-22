import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Response } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { requireUser } from "~/session.server";
import { route } from "routes-gen";
import { Button, Container, Text, Title } from "@mantine/core";
import { z } from "zod";
import {
  ensureCanJoinTeam,
  getTeamByInvite,
  joinTeam,
} from "~/models/team.server";
import type { Team } from "@prisma/client";

const inviteCodeSchema = z.string().uuid("Name is too short");

type LoaderData = { inviteCode: string; teamName: Team["name"] };

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const inviteCode = inviteCodeSchema.parse(url.searchParams.get("inviteCode"));
  const user = await requireUser(request, route("/register"));
  const team = await getTeamByInvite(inviteCode);

  if (team) {
    ensureCanJoinTeam(user, team);
    return json<LoaderData>({ inviteCode, teamName: team.name });
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const inviteCode = inviteCodeSchema.parse(formData.get("inviteCode"));
  const team = await getTeamByInvite(inviteCode);

  if (team) {
    await joinTeam(user, team);
    return redirect(route("/dashboard"));
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Join Team",
  };
};

export default function JoinTeam() {
  const { teamName, inviteCode } = useLoaderData<LoaderData>();

  return (
    <Container size="xs">
      <Title order={2}>Join Team</Title>
      <Text>You were invited to {teamName}. Do you want to join?</Text>
      <Form method="post">
        <Button type="submit" name="inviteCode" value={inviteCode}>
          Join
        </Button>
      </Form>
    </Container>
  );
}
