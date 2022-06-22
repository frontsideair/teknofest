import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  getAdvisorContests,
  getContests,
  getJudgeContests,
} from "~/models/contest.server";
import { getTeams } from "~/models/team.server";
import { logout, requireUser } from "~/session.server";

import AdvisorDashboard from "~/components/dashboard/Advisor";
import AdminDashboard from "~/components/dashboard/Admin";
import StudentDashboard from "~/components/dashboard/Student";
import JudgeDashboard from "~/components/dashboard/Judge";

type LoaderData =
  | { role: "admin"; contests: Awaited<ReturnType<typeof getContests>> }
  | { role: "judge"; contests: Awaited<ReturnType<typeof getJudgeContests>> }
  | {
      role: "advisor";
      contests: Awaited<ReturnType<typeof getAdvisorContests>>;
    }
  | { role: "student"; teams: Awaited<ReturnType<typeof getTeams>> };

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  switch (user.role) {
    case "admin":
      return json({ role: "admin", contests: await getContests() });
    case "judge":
      return json({ role: "judge", contests: await getJudgeContests(user.id) });
    case "advisor":
      return json({
        role: "advisor",
        contests: await getAdvisorContests(user.id),
      });
    case "student":
      return json({ role: "student", teams: await getTeams(user.id) });
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
    case "judge":
      return <JudgeDashboard contests={data.contests} />;
    case "advisor":
      return <AdvisorDashboard contests={data.contests} />;
    case "student":
      return <StudentDashboard teams={data.teams} />;
  }
}
