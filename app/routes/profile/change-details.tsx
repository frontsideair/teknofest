import { Button, Group, Stack, TextInput } from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { route } from "routes-gen";
import { z } from "zod";
import type { User } from "~/models/user.server";
import { fullNameSchema } from "~/models/user.server";
import { changeDetails } from "~/models/user.server";
import { requireUser, requireUserId } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import {
  errorMessagesForSchema,
  InputError,
  inputFromForm,
  makeDomainFunction,
} from "remix-domains";

type LoaderData = {
  fullName: User["fullName"];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json<LoaderData>({ fullName: user.fullName });
};

const formSchema = z.object({
  fullName: fullNameSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

const mutation = makeDomainFunction(
  formSchema,
  z.number()
)(async ({ fullName }, userId) => {
  try {
    await changeDetails(userId, fullName);
    return null;
  } catch {
    throw new InputError("Name is required", "fullName");
  }
});

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const result = await mutation(await inputFromForm(request), userId);

  if (result.success) {
    return redirect(route("/profile"));
  } else {
    return json<ActionData>(
      errorMessagesForSchema(result.inputErrors, formSchema),
      { status: 400 }
    );
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Profile | Change details",
  };
};

export default function Profile() {
  const loaderData = useLoaderData<Jsonify<LoaderData>>();
  const actionData = useActionData<ActionData>();
  const fullNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.fullName) {
      fullNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Stack>
      <Form method="post">
        <TextInput
          label="Full name"
          ref={fullNameRef}
          required
          autoFocus
          name="fullName"
          autoComplete="name"
          error={actionData?.fullName}
          placeholder="John Doe"
          defaultValue={loaderData.fullName}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Stack>
  );
}
