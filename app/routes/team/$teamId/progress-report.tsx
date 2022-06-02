import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { unstable_createFileUploadHandler } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import ProgressReportUploader from "~/components/ProgressReportUploader";
import { getTeam, setProgressReportPath } from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  if (team) {
    return json<LoaderData>({ team });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

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

    return redirect(
      route("/team/:teamId/progress-report", { teamId: String(teamId) })
    );
  } catch (error) {
    console.error("Something went wrong", error);
    return redirect(
      route("/team/:teamId/progress-report", { teamId: String(teamId) })
    );
  }
};

export default function ProgressReport() {
  const { team } = useLoaderData<LoaderData>();
  return (
    <Stack>
      <Title order={3}>Upload progress report</Title>
      <Form method="post" encType="multipart/form-data">
        <ProgressReportUploader />
        <Group mt="sm" position="apart">
          {team.progressReportPath ? (
            <Text>Uploaded report: {team.progressReportPath}</Text>
          ) : (
            <Text>No report uploaded yet</Text>
          )}
          <Button type="submit">Upload</Button>
        </Group>
      </Form>
    </Stack>
  );
}
