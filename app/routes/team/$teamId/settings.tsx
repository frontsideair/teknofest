import { Button, Group, Stack, TextInput, Title } from "@mantine/core";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { z } from "zod";
import { isCurrentContest } from "~/models/contest.server";
import { getTeam, nameSchema, updateTeam } from "~/models/team.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
  isCurrentContest: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  if (team) {
    const isCurrent = await isCurrentContest(team.contestId);
    return json<LoaderData>({ team, isCurrentContest: isCurrent });
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

  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  if (parseResult.success) {
    const name = parseResult.data.name;
    await updateTeam(teamId, name);
    return redirect(
      route("/team/:teamId/settings", { teamId: String(teamId) })
    );
  } else {
    const { fieldErrors } = parseResult.error.flatten();
    return json<ActionData>(fieldErrors, { status: 400 });
  }
};

export default function Settings() {
  const { team, isCurrentContest } = useLoaderData<Jsonify<LoaderData>>();
  const actionData = useActionData<ActionData>();

  return (
    <Stack>
      <Title order={3}>Change team details</Title>
      <Form method="post">
        <fieldset
          style={{ border: 0, padding: 0, margin: 0 }}
          disabled={!isCurrentContest}
        >
          <TextInput
            label="Team name"
            description="Maximum 10 characters"
            required
            name="name"
            error={actionData?.name}
            defaultValue={team.name}
            placeholder="My Team"
          />
          <Group position="right" mt="md">
            <Button type="submit">Save</Button>
          </Group>
        </fieldset>
      </Form>
    </Stack>
  );
}
