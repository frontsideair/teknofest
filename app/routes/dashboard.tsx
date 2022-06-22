import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { logout, requireUser } from "~/session.server";

import AdvisorDashboard, * as Advisor from "~/components/dashboard/Advisor";
import AdminDashboard, * as Admin from "~/components/dashboard/Admin";
import StudentDashboard, * as Student from "~/components/dashboard/Student";
import JudgeDashboard, * as Judge from "~/components/dashboard/Judge";

export const loader: LoaderFunction = async ({ request }) => {
  const { id, role } = await requireUser(request);
  switch (role) {
    case "admin":
      return json({ role, ...(await Admin.loader()) });
    case "judge":
      return json({ role, ...(await Judge.loader(id)) });
    case "advisor":
      return json({ role, ...(await Advisor.loader(id)) });
    case "student":
      return json({ role, ...(await Student.loader(id)) });
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
  const { role } = useLoaderData();

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "judge":
      return <JudgeDashboard />;
    case "advisor":
      return <AdvisorDashboard />;
    case "student":
      return <StudentDashboard />;
  }
}
