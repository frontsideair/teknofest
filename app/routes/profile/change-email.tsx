import {
  Button,
  Container,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Outlet, useActionData } from "@remix-run/react";
import React from "react";
import { route } from "routes-gen";
import { z } from "zod";
import { changeEmail, emailSchema, passwordSchema } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return null;
};

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  const userId = await requireUserId(request);

  if (parseResult.success) {
    const email = parseResult.data.email;
    const password = parseResult.data.password;

    try {
      await changeEmail(userId, email, password);
      return redirect(route("/profile"));
    } catch {
      return json<ActionData>(
        { password: ["Password is wrong"] },
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
    <Container size="xs">
      <Outlet />
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
        />

        <PasswordInput
          label="Password"
          description="Enter your existing password to confirm"
          ref={passwordRef}
          required
          name="password"
          autoComplete="current-password"
          error={actionData?.password}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Container>
  );
}
