import { unstable_createFileUploadHandler } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/server-runtime";
import { unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { setProgressReportPath } from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

export const action: ActionFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");

  try {
    const uploadHandler = unstable_createFileUploadHandler({
      maxPartSize: 60_000_000,
      file: ({ filename }) => filename,
      directory: process.env.UPLOAD_DIR,
    });

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    );

    const progressReport = formData.get("progressReport");

    if (progressReport === null || typeof progressReport === "string") {
      throw new Error("No file was uploaded");
    }

    await setProgressReportPath(teamId, progressReport.name);

    return redirect(route("/team/:teamId", { teamId: String(teamId) }));
  } catch (error) {
    console.error("Something went wrong", error);
    return redirect(route("/team/:teamId", { teamId: String(teamId) }));
  }
};
