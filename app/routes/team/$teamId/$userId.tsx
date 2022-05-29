import type { ActionFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import {
  assignResponsibility,
  removeFromTeam,
  responsibilitySchema,
} from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

export const action: ActionFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  const userId = numericString.parse(params.userId);
  const formData = await request.formData();
  await requireRole(request, "advisor");

  switch (request.method) {
    case "POST": {
      const responsibility = responsibilitySchema.parse(
        formData.get("responsibility")
      );
      try {
        await assignResponsibility(userId, teamId, responsibility);
      } catch (error) {
        console.error(error);
        throw new Response("Error", { status: 403 });
      }
      return redirect(route("/team/:teamId", { teamId: String(teamId) }));
    }
    case "DELETE": {
      await removeFromTeam(userId, teamId);
      return redirect(route("/team/:teamId", { teamId: String(teamId) }));
    }
    default: {
      throw new Response("Method not allowed", { status: 405 });
    }
  }
};
