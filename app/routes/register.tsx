import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";
import { safeRedirect } from "~/utils";
import { route } from "routes-gen";
import {
  Anchor,
  Button,
  Container,
  Group,
  Radio,
  RadioGroup,
  Text,
  TextInput,
} from "@mantine/core";
import { z } from "zod";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const formSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password is too short"),
  redirectTo: z.string(),
  role: z.enum(["advisor", "student"]),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const email = parseResult.data.email;
    const password = parseResult.data.password;
    const redirectTo = safeRedirect(parseResult.data.redirectTo, "/dashboard");

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return json<ActionData>(
        { email: ["A user already exists with this email"] },
        { status: 400 }
      );
    }

    const user = await createUser(email, password);

    return createUserSession({
      request,
      userId: user.id,
      remember: false,
      redirectTo,
    });
  } else {
    const { fieldErrors } = parseResult.error.flatten();
    return json<ActionData>(fieldErrors, { status: 400 });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
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
      <Form method="post">
        <TextInput
          label="Email address"
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
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="new-password"
          error={actionData?.password}
        />

        <RadioGroup label="Role" name="role" defaultValue="advisor">
          <Radio value="advisor" label="Advisor" />
          <Radio value="student" label="Student" />
        </RadioGroup>

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Group position="right" mt="md">
          <Button type="submit">Create Account</Button>
        </Group>

        <Text align="center" mt="md">
          Already have an account?{" "}
          <Anchor
            component={Link}
            to={{
              pathname: route("/login"),
              search: searchParams.toString(),
            }}
          >
            Log in
          </Anchor>
        </Text>
      </Form>
    </Container>
  );
}
