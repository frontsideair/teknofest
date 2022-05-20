import {
  Anchor,
  Badge,
  Container,
  Group,
  LoadingOverlay,
  Menu,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { route } from "routes-gen";
import { Prism } from "@mantine/prism";
import { getTeam, removeFromTeam } from "~/models/team.server";
import { requireAdvisor } from "~/session.server";
import { numericString } from "~/utils/zod";

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

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    await requireAdvisor(request);
    const formData = await request.formData();
    const teamId = numericString.parse(params.teamId);
    const userId = numericString.parse(formData.get("userId"));
    await removeFromTeam(userId, teamId);
    return redirect(route("/team/:teamId", { teamId: String(teamId) }));
  } else {
    throw new Response("Method not allowed", { status: 405 });
  }
};

export default function TeamPage() {
  const team = useLoaderData<LoaderData>();
  const transition = useTransition();

  const inviteLink = `https://teknofest.fly.io/team/join?inviteCode=${team.inviteCode}`;

  return (
    <Container size="sm">
      <Title order={2}>Team {team.name}</Title>
      <Title order={3}>Invite team members</Title>
      <Text>
        You can have 5-15 team members, including you. One of them can be the
        co-advisor. Use the invite link to{" "}
        <Anchor
          href={`mailto:student@example.com?subject=Join ${team.name} in Teknofest&body=Create an account at https://teknofest.fly.io/register and use the invite link ${inviteLink} to join the team.`}
        >
          invite members
        </Anchor>{" "}
        to your team.
      </Text>
      <Prism language="markup">{inviteLink}</Prism>
      <Title order={3}>Team members</Title>
      <Stack>
        {team.members.length ? (
          team.members.map((member) => (
            <Group
              key={member.userId}
              position="apart"
              sx={{ position: "relative" }}
              p="md"
            >
              <LoadingOverlay visible={transition.state !== "idle"} />
              <Text>
                {member.user.email} <Badge>{member.user.role}</Badge>
              </Text>
              <Menu>
                <Menu.Item>
                  <Form method="delete">
                    <UnstyledButton
                      type="submit"
                      name="userId"
                      value={member.userId}
                    >
                      Remove from team
                    </UnstyledButton>
                  </Form>
                </Menu.Item>
              </Menu>
            </Group>
          ))
        ) : (
          <Text>You have no team members.</Text>
        )}
      </Stack>
    </Container>
  );
}
