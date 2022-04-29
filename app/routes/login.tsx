import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { safeRedirect } from "~/utils";
import { route } from "routes-gen";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
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
  redirectTo: z.string().nullable(),
  remember: z.literal("on").nullable(),
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));

  if (parseResult.success) {
    const email = parseResult.data.email;
    const password = parseResult.data.password;
    const redirectTo = safeRedirect(parseResult.data.redirectTo, "/dashboard");
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
      redirectTo,
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
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
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
          autoComplete="current-password"
          error={actionData?.password}
        />

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <Group position="apart" mt="md">
          <Checkbox label="Remember me" name="remember" />
          <Button type="submit">Log in</Button>
        </Group>

        <Text align="center" mt="md">
          Don't have an account?{" "}
          <Anchor
            component={Link}
            to={{
              pathname: route("/register"),
              search: searchParams.toString(),
            }}
          >
            Sign up
          </Anchor>
        </Text>
      </Form>
    </Container>
  );
}
