import { Anchor, Container, Stack } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export const meta: MetaFunction = () => {
  return {
    title: "Profile",
  };
};

export default function Profile() {
  return (
    <Container size="sm">
      <Stack>
        <Anchor component={Link} to={route("/profile/change-email")}>
          Change email
        </Anchor>
        <Anchor component={Link} to={route("/profile/change-password")}>
          Change password
        </Anchor>
      </Stack>
    </Container>
  );
}
