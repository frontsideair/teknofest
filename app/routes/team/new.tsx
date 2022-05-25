import * as React from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { requireRole, requireUserId } from "~/session.server";
import { route } from "routes-gen";
import { Button, Container, Group, TextInput, Title } from "@mantine/core";
import { z } from "zod";
import { createTeam } from "~/models/team.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireRole(request, "advisor");
  return null;
};

const formSchema = z.object({
  name: z.string().min(0, "Name is too short").max(10, "Name is too long"),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const name = parseResult.data.name;

    try {
      const team = await createTeam(name, userId);

      return redirect(route("/team/:teamId", { teamId: String(team.id) }));
    } catch (error) {
      return json<ActionData>(
        { name: ["Name is not unique"] },
        { status: 400 }
      );
    }
  } else {
    const { fieldErrors } = parseResult.error.flatten();
    return json<ActionData>(fieldErrors, { status: 400 });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Create New Team",
  };
};

export default function NewTeam() {
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
          ref={nameRef}
          required
          autoFocus
          name="name"
          error={actionData?.name}
        />

        <Group position="right" mt="md">
          <Button type="submit">Create</Button>
        </Group>
      </Form>
    </Container>
  );
}
