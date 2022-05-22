import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as React from "react";

import { getUserId, createUserSession } from "~/session.server";

import { createUser, getUserByEmail } from "~/models/user.server";
import { route } from "routes-gen";
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
import { z } from "zod";

export const loader: LoaderFunction = async ({ request }) => {
  // TODO: registration open only if there is an active contest
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const formSchema = z.object({
  email: z.string().email("Email is invalid"),
  password: z.string().min(8, "Password is too short"),
  role: z.enum(["advisor", "student"]),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
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

    const user = await createUser(email, password, role);

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
      <Title order={2}>Register</Title>
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
