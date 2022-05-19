import {
  Anchor,
  Badge,
  Card,
  Container,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { getTeam } from "~/models/team.server";
import { Prism } from "@mantine/prism";
import { requireAdvisor } from "~/session.server";

const numericString = z.string().regex(/^\d+$/).transform(Number);

type LoaderData = NonNullable<Awaited<ReturnType<typeof getTeam>>>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  const user = await requireAdvisor(request);
  const team = await getTeam(user.id, teamId);
  if (team) {
    return json<LoaderData>(team);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function TeamPage() {
  const team = useLoaderData<LoaderData>();
  return (
    <Container size="sm">
      <Title order={2}>Team {team.name}</Title>
      <Title order={3}>Invite team members</Title>
      <Text>
        You can have 5-15 team members, including you. One of them can be an
        additional advisor. Use the invite code to{" "}
        <Anchor
          href={`mailto:student@example.com?subject=Join ${team.name} in Teknofest&body=Create an account at https://teknofest.fly.io/register and use the invite code ${team.inviteCode} to join the team.`}
        >
          invite members
        </Anchor>{" "}
        to your team.
      </Text>
      <Prism language="markup">{team.inviteCode}</Prism>
      <Title order={3}>Team members</Title>
      <Stack>
        {team.members.length ? (
          team.members.map((member) => (
            <Card key={member.userId}>
              <Text>
                {member.user.email} <Badge>{member.user.role}</Badge>
              </Text>
            </Card>
          ))
        ) : (
          <Text>You have no team members.</Text>
        )}
      </Stack>
    </Container>
  );
}
