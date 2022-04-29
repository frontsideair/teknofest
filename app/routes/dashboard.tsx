import { Container } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { requireUser } from "~/session.server";
import { useUser } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export default function Dashboard() {
  const user = useUser();

  return <Container>{user.role}</Container>;
}
