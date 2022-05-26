import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Prism } from "@mantine/prism";
import { getTeam, removeFromTeam } from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";
import { getBaseUrl } from "~/utils/common";
import TeamMembers from "~/components/TeamMembers";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
  baseUrl: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  const user = await requireRole(request, "advisor");
  const team = await getTeam(user.id, teamId);
  const baseUrl = getBaseUrl();
  if (team) {
    return json<LoaderData>({ team, baseUrl });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    await requireRole(request, "advisor");
    const formData = await request.formData();
    const teamId = numericString.parse(params.teamId);
    const userId = numericString.parse(formData.get("userId"));
    await removeFromTeam(userId, teamId);
    return redirect(route("/team/:teamId", { teamId: String(teamId) }));
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Team ${data?.team?.name}`,
  };
};

export default function TeamPage() {
  const { team, baseUrl } = useLoaderData<LoaderData>();

  const inviteLink = `${baseUrl}/team/join?inviteCode=${team.inviteCode}`;

  return (
    <Container size="sm">
      <Title order={2}>Team {team.name}</Title>
      <Stack spacing="md">
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

        <Title order={3}>Team members</Title>
        <TeamMembers users={team.members.map(({ user }) => user)} />
      </Stack>
    </Container>
  );
}
