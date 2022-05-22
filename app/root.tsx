import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import {
  Anchor,
  AppShell,
  Badge,
  Button,
  Group,
  Header,
  MantineProvider,
  Title,
} from "@mantine/core";

import { getUser } from "./session.server";
import { route } from "routes-gen";
import LogoutButton from "./components/LogoutButton";
import { useColorScheme } from "@mantine/hooks";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Teknofest",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

function AppHeader() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <Header height="auto">
      <Group position="apart" p="md">
        <Anchor component={Link} to={route("/")}>
          <Title order={1}>Teknofest</Title>
        </Anchor>
        {user ? (
          <Group>
            <Badge>{user.role}</Badge>
            <Anchor component={Link} to={route("/profile")}>
              {user.email}
            </Anchor>
            <Anchor component={Link} to={route("/dashboard")}>
              Dashboard
            </Anchor>
            <LogoutButton />
          </Group>
        ) : (
          <Group>
            <Button component={Link} to={route("/login")}>
              Login
            </Button>
            <Button component={Link} to={route("/register")}>
              Register
            </Button>
          </Group>
        )}
      </Group>
    </Header>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider
          theme={{ colorScheme }}
          withNormalizeCSS
          withGlobalStyles
        >
          <AppShell header={<AppHeader />}>
            <Outlet />
          </AppShell>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: any }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>An error happened!</h1>
        <Scripts />
      </body>
    </html>
  );
}
