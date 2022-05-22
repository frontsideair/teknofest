import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getAdvisorContests, getContests } from "~/models/contest.server";
import { logout, requireUser } from "~/session.server";

import AdvisorDashboard from "~/components/AdvisorDashboard";
import AdminDashboard from "~/components/AdminDashboard";

type LoaderData =
  | { role: "admin"; contests: Awaited<ReturnType<typeof getContests>> }
  | {
      role: "advisor";
      contests: Awaited<ReturnType<typeof getAdvisorContests>>;
    }
  | { role: "student" };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  switch (user.role) {
    case "admin":
      return json({ role: "admin", contests: await getContests() });
    case "advisor":
      return json({
        role: "advisor",
        contests: await getAdvisorContests(user.id),
      });
    case "student":
      return json({ role: "student" });
    default:
      return logout(request);
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Dashboard",
  };
};

export default function Dashboard() {
  const data = useLoaderData<LoaderData>();

  switch (data.role) {
    case "admin":
      return <AdminDashboard contests={data.contests} />;
    case "advisor":
      return <AdvisorDashboard contests={data.contests} />;
    case "student":
      return null;
  }
}
