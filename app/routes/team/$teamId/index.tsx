import {
  Anchor,
  Button,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Prism } from "@mantine/prism";
import {
  getTeam,
  nameSchema,
  regenerateInviteCode,
  updateTeam,
} from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";
import { getBaseUrl } from "~/utils/common";
import TeamMembers from "~/components/TeamMembers";
import { z } from "zod";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
  baseUrl: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  const baseUrl = getBaseUrl();
  if (team) {
    return json<LoaderData>({ team, baseUrl });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

const formSchema = z.object({
  name: nameSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  const formData = await request.formData();
  await requireRole(request, "advisor");

  switch (request.method) {
    case "POST": {
      const parseResult = formSchema.safeParse(Object.fromEntries(formData));
      if (parseResult.success) {
        const name = parseResult.data.name;
        await updateTeam(teamId, name);
        return redirect(route("/team/:teamId", { teamId: String(teamId) }));
      } else {
        const { fieldErrors } = parseResult.error.flatten();
        return json<ActionData>(fieldErrors, { status: 400 });
      }
    }
    case "PUT": {
      await regenerateInviteCode(teamId);
      return redirect(route("/team/:teamId", { teamId: String(teamId) }));
    }
    default: {
      throw new Response("Method not allowed", { status: 405 });
    }
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Team ${data?.team?.name}`,
  };
};

export default function TeamPage() {
  const { team, baseUrl } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

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
        <Form method="put">
          <Button type="submit">Regenerate invite code</Button>
        </Form>

        <Title order={3}>Change team details</Title>
        <Form method="post">
          <TextInput
            label="Team name"
            description="Maximum 10 characters"
            required
            name="name"
            error={actionData?.name}
            defaultValue={team.name}
          />
          <Group position="right" mt="md">
            <Button type="submit">Save</Button>
          </Group>
        </Form>

        <Title order={3}>Team members</Title>
        <TeamMembers members={team.members} />
      </Stack>
    </Container>
  );
}
