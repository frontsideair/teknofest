import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect, Response } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";

import {
  Anchor,
  Button,
  Container,
  Group,
  PasswordInput,
  Radio,
  RadioGroup,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { route } from "routes-gen";
import { z } from "zod";
import { getContestWithApplicationsOpen } from "~/models/contest.server";
import {
  createUser,
  emailSchema,
  fullNameSchema,
  getUserByEmail,
  passwordSchema,
  roleSchema,
} from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const contest = await getContestWithApplicationsOpen();
  if (!contest) {
    throw new Response("There is no active contest", { status: 404 });
  }

  return json({});
};

const formSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const fullName = parseResult.data.fullName;
    const email = parseResult.data.email;
    const password = parseResult.data.password;
    const role = parseResult.data.role;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return json<ActionData>(
        { email: ["A user already exists with this email"] },
        { status: 400 }
      );
    }

    const user = await createUser(fullName, email, password, role);

    return createUserSession({
      request,
      userId: user.id,
      remember: false,
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

export default function Register() {
  const actionData = useActionData<ActionData>();
  const fullNameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.fullName) {
      fullNameRef.current?.focus();
    } else if (actionData?.email) {
      emailRef.current?.focus();
    } else if (actionData?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs">
      <Title order={2}>Register</Title>
      <Form method="post">
        <TextInput
          label="Full name"
          ref={fullNameRef}
          required
          autoFocus
          name="fullName"
          autoComplete="name"
          error={actionData?.fullName}
        />

        <TextInput
          label="Email address"
          ref={emailRef}
          required
          name="email"
          type="email"
          autoComplete="email"
          error={actionData?.email}
        />

        <PasswordInput
          label="Password"
          description="Must be at least 8 characters"
          ref={passwordRef}
          required
          name="password"
          autoComplete="new-password"
          error={actionData?.password}
        />

        <RadioGroup label="Role" name="role" defaultValue="advisor">
          <Radio value="advisor" label="Advisor" />
          <Radio value="judge" label="Judge" />
          <Radio value="student" label="Student" />
        </RadioGroup>

        <Group position="right" mt="md">
          <Button type="submit">Create Account</Button>
        </Group>

        <Text align="center" mt="md">
          Already have an account?{" "}
          <Anchor component={Link} to={route("/login")}>
            Log in
          </Anchor>
        </Text>
      </Form>
    </Container>
  );
}
