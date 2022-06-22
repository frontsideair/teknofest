import { Button, Group, PasswordInput, Stack } from "@mantine/core";
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
import { changePassword, passwordSchema } from "~/models/user.server";
import { requireUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return null;
};

const formSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  const userId = await requireUserId(request);

  if (parseResult.success) {
    const oldPassword = parseResult.data.oldPassword;
    const newPassword = parseResult.data.newPassword;

    try {
      await changePassword(userId, oldPassword, newPassword);
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

  React.useEffect(() => {
    if (actionData?.oldPassword) {
      oldPasswordRef.current?.focus();
    } else if (actionData?.newPassword) {
      newPasswordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Stack>
      <Form method="post">
        <PasswordInput
          label="Old password"
          description="Enter your existing password"
          ref={oldPasswordRef}
          required
          name="oldPassword"
          autoComplete="current-password"
          error={actionData?.oldPassword}
          placeholder="••••••••••••"
        />

        <PasswordInput
          label="New password"
          description="Enter your new password"
          ref={newPasswordRef}
          required
          name="newPassword"
          autoComplete="new-password"
          error={actionData?.newPassword}
          placeholder="••••••••••••"
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Stack>
  );
}
