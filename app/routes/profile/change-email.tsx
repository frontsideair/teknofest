import { Button, Container, Group, TextInput } from "@mantine/core";
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
import { changeEmail } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { useUser } from "~/utils/hooks";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

const formSchema = z.object({
  id: z.preprocess((a) => parseInt(a as string, 10), z.number().positive()),
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password is too short"),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const id = parseResult.data.id;
    const email = parseResult.data.email;
    const password = parseResult.data.password;

    try {
      await changeEmail(id, email, password);
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
  const { id } = useUser();

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
        <input type="hidden" name="id" value={id} />

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

        <TextInput
          label="Password"
          description="Enter your existing password to confirm"
          ref={passwordRef}
          name="password"
          type="password"
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
