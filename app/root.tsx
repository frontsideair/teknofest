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
} from "@remix-run/react";
import {
  AppShell,
  Button,
  Group,
  Header,
  MantineProvider,
} from "@mantine/core";

import { getUser } from "./session.server";
import { route } from "routes-gen";
import { useOptionalUser } from "./utils";
import LogoutButton from "./components/LogoutButton";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
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
  const maybeUser = useOptionalUser();
  return (
    <Header height="auto">
      {maybeUser ? (
        <Group>
          <LogoutButton />
        </Group>
      ) : (
        <Group>
          <Button component={Link} to={route("/login")}>
            Login
          </Button>
          <Button component={Link} to={route("/join")}>
            Register
          </Button>
        </Group>
      )}
    </Header>
  );
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <MantineProvider withNormalizeCSS withGlobalStyles>
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
