import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { route } from "routes-gen";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  PasswordInput,
  Text,
  TextInput,
  Title,
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
  remember: z.literal("on").optional(),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const email = parseResult.data.email;
    const password = parseResult.data.password;
    const remember = parseResult.data.remember === "on";

    const user = await verifyLogin(email, password);

    if (!user) {
      return json<ActionData>(
        { email: ["Invalid email or password"] },
        { status: 400 }
      );
    }

    return createUserSession({
      request,
      userId: user.id,
      remember,
    });
  } else {
    const { fieldErrors } = parseResult.error.flatten();
    return json<ActionData>(fieldErrors, { status: 400 });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
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
      <Title order={2}>Login</Title>
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
          autoComplete="current-password"
          error={actionData?.password}
        />

        <Group position="apart" mt="md">
          <Checkbox label="Remember me" name="remember" />
          <Button type="submit">Log in</Button>
        </Group>

        <Text align="center" mt="md">
          Don't have an account?{" "}
          <Anchor component={Link} to={route("/register")}>
            Sign up
          </Anchor>
        </Text>
      </Form>
    </Container>
  );
}
