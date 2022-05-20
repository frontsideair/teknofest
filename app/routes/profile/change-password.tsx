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
import { changePassword } from "~/models/user.server";
import { requireUser } from "~/session.server";
import { useUser } from "~/utils/hooks";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

const formSchema = z.object({
  id: z.preprocess((a) => parseInt(a as string, 10), z.number().positive()),
  oldPassword: z.string().min(8, "Password is too short"),
  newPassword: z.string().min(8, "Password is too short"),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const id = parseResult.data.id;
    const oldPassword = parseResult.data.oldPassword;
    const newPassword = parseResult.data.newPassword;

    try {
      await changePassword(id, oldPassword, newPassword);
      return redirect(route("/profile"));
    } catch {
      return json<ActionData>(
        { oldPassword: ["Password is wrong"] },
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
    title: "Profile | Change password",
  };
};

export default function Profile() {
  const actionData = useActionData<ActionData>();
  const oldPasswordRef = React.useRef<HTMLInputElement>(null);
  const newPasswordRef = React.useRef<HTMLInputElement>(null);
  const { id } = useUser();

  React.useEffect(() => {
    if (actionData?.oldPassword) {
      oldPasswordRef.current?.focus();
    } else if (actionData?.newPassword) {
      newPasswordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Outlet />
      <Form method="post">
        <input type="hidden" name="id" value={id} />

        <TextInput
          label="Old password"
          description="Enter your existing password"
          ref={oldPasswordRef}
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          error={actionData?.oldPassword}
        />

        <TextInput
          label="New password"
          description="Enter your new password"
          ref={newPasswordRef}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          error={actionData?.newPassword}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Container>
  );
}
