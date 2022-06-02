import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { regenerateInviteCode } from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

export const action: ActionFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  await regenerateInviteCode(teamId);
  return redirect(route("/team/:teamId", { teamId: String(teamId) }));
};
