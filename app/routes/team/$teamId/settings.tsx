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
import {
  InputError,
  errorMessagesForSchema,
  inputFromForm,
  makeDomainFunction,
  EnvironmentError,
} from "remix-domains";

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

const mutation = makeDomainFunction(
  formSchema,
  numericString
)(async ({ name }, teamId) => {
  const team = await getTeam(teamId);
  if (team) {
    const { minTeamNameLength, maxTeamNameLength } = team.contest;
    if (name.length < minTeamNameLength) {
      throw new InputError("Name too short", "name");
    } else if (name.length > maxTeamNameLength) {
      throw new InputError("Name too long", "name");
    } else {
      try {
        await updateTeam(teamId, name);
        return team.id;
      } catch {
        throw new InputError("Name is not unique", "name");
      }
    }
  } else {
    throw new EnvironmentError("No such team found", "teamId");
  }
});

export const action: ActionFunction = async ({ request, params }) => {
  await requireRole(request, "advisor");
  const result = await mutation(await inputFromForm(request), params.teamId);

  if (result.success) {
    return redirect(
      route("/team/:teamId/settings", { teamId: String(result.data) })
    );
  } else {
    if (result.environmentErrors.length > 0) {
      throw new Response("No such team found", { status: 404 });
    } else {
      return json<ActionData>(
        errorMessagesForSchema(result.inputErrors, formSchema),
        { status: 400 }
      );
    }
  }
};

export default function Settings() {
  const { team, isCurrentContest } = useLoaderData<Jsonify<LoaderData>>();
  const actionData = useActionData<ActionData>();
  const { minTeamNameLength, maxTeamNameLength } = team.contest;

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
            description={`Should be between ${minTeamNameLength} and ${maxTeamNameLength} characters`}
            minLength={minTeamNameLength}
            maxLength={maxTeamNameLength}
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
