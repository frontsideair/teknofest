import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json({ role: user.role });
};

export default function Dashboard() {
  const { role } = useLoaderData();

  return <div>{role}</div>;
}
