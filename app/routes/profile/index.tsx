import { Stack } from "@mantine/core";
import type { User } from "@prisma/client";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = User;

export const loader: LoaderFunction = async ({ request }) => {
  return await requireUser(request);
};

export const meta: MetaFunction = () => {
  return {
    title: "Profile",
  };
};

export default function Profile() {
  const user = useLoaderData<Jsonify<LoaderData>>();
  return <Stack>Welcome {user.fullName}!</Stack>;
}
