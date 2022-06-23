import { Button, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import React from "react";
import { route } from "routes-gen";
import { z } from "zod";
import { changeEmail, emailSchema, passwordSchema } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import {
  InputError,
  errorMessagesForSchema,
  inputFromForm,
  makeDomainFunction,
} from "remix-domains";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return null;
};

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

const mutation = makeDomainFunction(
  formSchema,
  z.number()
)(async ({ email, password }, userId) => {
  try {
    await changeEmail(userId, email, password);
    return null;
  } catch {
    throw new InputError("Password is wrong", "password");
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
    title: "Profile | Change email",
  };
};

export default function Profile() {
  const actionData = useActionData<ActionData>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.email) {
      emailRef.current?.focus();
    } else if (actionData?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Stack>
      <Form method="post">
        <TextInput
          label="New email address"
          ref={emailRef}
          required
          autoFocus
          name="email"
          type="email"
          autoComplete="email"
          error={actionData?.email}
          placeholder="user@example.com"
        />

        <PasswordInput
          label="Password"
          description="Enter your existing password to confirm"
          ref={passwordRef}
          required
          name="password"
          autoComplete="current-password"
          error={actionData?.password}
          placeholder="••••••••••••"
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Stack>
  );
}
