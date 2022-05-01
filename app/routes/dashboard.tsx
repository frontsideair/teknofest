import { Container } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { requireUser } from "~/session.server";
import { useUser } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request);
  return null;
};

export const meta: MetaFunction = () => {
  return {
    title: "Dashboard",
  };
};

export default function Dashboard() {
  const user = useUser();

  return <Container size="sm">{user.role}</Container>;
}
