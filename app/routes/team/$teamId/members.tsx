import { Anchor, Button, Stack, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import TeamMembers from "~/components/TeamMembers";
import { isCurrentContest } from "~/models/contest.server";
import {
  assignResponsibility,
  getTeam,
  regenerateInviteCode,
  removeFromTeam,
  responsibilitySchema,
} from "~/models/team.server";
import { requireRole } from "~/session.server";
import { getBaseUrl } from "~/utils/common";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
  baseUrl: string;
  isCurrentContest: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  const baseUrl = getBaseUrl();
  if (team) {
    const isCurrent = await isCurrentContest(team.contestId);
    return json<LoaderData>({ team, baseUrl, isCurrentContest: isCurrent });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");

  switch (request.method) {
    case "POST": {
      const formData = await request.formData();
      const userId = numericString.parse(formData.get("userId"));
      const responsibility = responsibilitySchema.parse(
        formData.get("responsibility")
      );
      try {
        await assignResponsibility(userId, teamId, responsibility);
      } catch (error) {
        console.error(error);
        throw new Response("Error", { status: 403 });
      }
      return redirect(
        route("/team/:teamId/members", { teamId: String(teamId) })
      );
    }
    case "DELETE": {
      const formData = await request.formData();
      const userId = numericString.parse(formData.get("userId"));
      await removeFromTeam(userId, teamId);
      return redirect(
        route("/team/:teamId/members", { teamId: String(teamId) })
      );
    }
    case "PUT": {
      await regenerateInviteCode(teamId);
      return redirect(
        route("/team/:teamId/members", { teamId: String(teamId) })
      );
    }
    default: {
      throw new Response("Method not allowed", { status: 405 });
    }
  }
};

export default function Members() {
  const { team, baseUrl, isCurrentContest } =
    useLoaderData<Jsonify<LoaderData>>();
  const inviteLink = `${baseUrl}/team/join?inviteCode=${team.inviteCode}`;

  return (
    <Stack>
      <Title order={3}>Team members</Title>
      <TeamMembers members={team.members} />

      <Title order={3}>Invite team members</Title>
      <Text>
        You can have 5-15 team members, including you. One of them can be the
        co-advisor. Use the invite link to{" "}
        <Anchor
          href={`mailto:student@example.com?subject=Join ${team.name} in Teknofest&body=Use the invite link ${inviteLink} to join the team.`}
        >
          invite members
        </Anchor>{" "}
        to your team.
      </Text>

      <Prism language="markup">{inviteLink}</Prism>
      <Form method="put">
        <Button type="submit" disabled={!isCurrentContest}>
          Regenerate invite code
        </Button>
      </Form>
    </Stack>
  );
}
