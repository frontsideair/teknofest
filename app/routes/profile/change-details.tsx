import { Button, Container, Group, TextInput } from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Outlet, useActionData, useLoaderData } from "@remix-run/react";
import React from "react";
import { route } from "routes-gen";
import { z } from "zod";
import type { User } from "~/models/user.server";
import { fullNameSchema } from "~/models/user.server";
import { changeDetails } from "~/models/user.server";
import { requireUser, requireUserId } from "~/session.server";

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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  const userId = await requireUserId(request);

  if (parseResult.success) {
    const fullName = parseResult.data.fullName;

    try {
      await changeDetails(userId, fullName);
      return redirect(route("/profile"));
    } catch {
      return json<ActionData>(
        { fullName: ["Name is required"] },
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
    title: "Profile | Change details",
  };
};

export default function Profile() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const fullNameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.fullName) {
      fullNameRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Outlet />
      <Form method="post">
        <TextInput
          label="Full name"
          ref={fullNameRef}
          required
          autoFocus
          name="fullName"
          autoComplete="name"
          error={actionData?.fullName}
          defaultValue={actionData?.fullName ?? loaderData.fullName}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Container>
  );
}
