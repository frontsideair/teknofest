import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { emailSchema, passwordSchema, verifyLogin } from "~/models/user.server";
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
import {
  errorMessagesForSchema,
  InputError,
  inputFromForm,
  makeDomainFunction,
} from "remix-domains";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

const formSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.literal("on").optional(),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

const mutation = makeDomainFunction(formSchema)(
  async ({ email, password, remember }) => {
    const user = await verifyLogin(email, password);
    if (!user) {
      throw new InputError("Invalid email or password", "email");
    } else {
      return { user, remember };
    }
  }
);

export const action: ActionFunction = async ({ request }) => {
  const result = await mutation(await inputFromForm(request));

  if (result.success) {
    return createUserSession({
      request,
      userId: result.data.user.id,
      remember: result.data.remember === "on",
    });
  } else {
    return json<ActionData>(
      errorMessagesForSchema(result.inputErrors, formSchema),
      { status: 400 }
    );
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
          placeholder="user@example.com"
        />

        <PasswordInput
          label="Password"
          description="Must be at least 8 characters"
          ref={passwordRef}
          required
          name="password"
          autoComplete="current-password"
          error={actionData?.password}
          placeholder="••••••••••••"
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
