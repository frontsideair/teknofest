import * as React from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { requireRole, requireUserId } from "~/session.server";
import { route } from "routes-gen";
import { Button, Container, Group, TextInput, Title } from "@mantine/core";
import { z } from "zod";
import { createTeam, nameSchema } from "~/models/team.server";
import { getContestWithApplicationsOpen } from "~/models/contest.server";
import {
  InputError,
  errorMessagesForSchema,
  inputFromForm,
  makeDomainFunction,
  EnvironmentError,
} from "remix-domains";

type LoaderData = {
  minTeamNameLength: number;
  maxTeamNameLength: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireRole(request, "advisor");
  const contest = await getContestWithApplicationsOpen();
  if (!contest) {
    throw new Response("No contest with applications open", { status: 404 });
  } else {
    const { minTeamNameLength, maxTeamNameLength } = contest;
    return json({ minTeamNameLength, maxTeamNameLength });
  }
};

const formSchema = z.object({
  name: nameSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

const mutation = makeDomainFunction(
  formSchema,
  z.number()
)(async ({ name }, userId) => {
  const contest = await getContestWithApplicationsOpen();
  if (contest) {
    const { minTeamNameLength, maxTeamNameLength } = contest;
    if (name.length < minTeamNameLength) {
      throw new InputError("Name too short", "name");
    } else if (name.length > maxTeamNameLength) {
      throw new InputError("Name too long", "name");
    } else {
      try {
        const team = await createTeam(name, userId);
        return team.id;
      } catch {
        throw new InputError("Name is not unique", "name");
      }
    }
  } else {
    throw new EnvironmentError("No contest with applications open", "userId");
  }
});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const result = await mutation(await inputFromForm(request), userId);

  if (result.success) {
    return redirect(route("/team/:teamId", { teamId: String(result.data) }));
  } else {
    if (result.environmentErrors.length > 0) {
      throw new Response("No contest with applications open", { status: 404 });
    } else {
      return json<ActionData>(
        errorMessagesForSchema(result.inputErrors, formSchema),
        { status: 400 }
      );
    }
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Create New Team",
  };
};

export default function NewTeam() {
  const { minTeamNameLength, maxTeamNameLength } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Title order={2}>Create new team</Title>
      <Form method="post">
        <TextInput
          label="Team name"
          description={`Should be between ${minTeamNameLength} and ${maxTeamNameLength} characters`}
          minLength={minTeamNameLength}
          maxLength={maxTeamNameLength}
          ref={nameRef}
          required
          autoFocus
          name="name"
          error={actionData?.name}
          placeholder="My Team"
        />

        <Group position="right" mt="md">
          <Button type="submit">Create</Button>
        </Group>
      </Form>
    </Container>
  );
}
