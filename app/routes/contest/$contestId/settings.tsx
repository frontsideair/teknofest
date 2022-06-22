import { Button, Group, Stack, Title } from "@mantine/core";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { z } from "zod";
import DateRangePicker from "~/components/DateRangePicker";
import { getContest, updateContest } from "~/models/contest.server";
import { requireRole } from "~/session.server";
import type { Jsonify } from "~/utils/jsonify";
import { dateRangeString, numericString } from "~/utils/zod";

type LoaderData = {
  contest: NonNullable<Awaited<ReturnType<typeof getContest>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "admin");
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>({ contest });
  } else {
    throw new Response("No such contest found", { status: 404 });
  }
};

const formSchema = z.object({
  applicationDateRange: dateRangeString,
  letterUploadDateRange: dateRangeString,
  designReportDateRange: dateRangeString,
  techControlsDateRange: dateRangeString,
  finalRaceDateRange: dateRangeString,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ params, request }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "admin");
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  if (parseResult.success) {
    const {
      applicationDateRange,
      letterUploadDateRange,
      designReportDateRange,
      techControlsDateRange,
      finalRaceDateRange,
    } = parseResult.data;
    const { id } = await updateContest(
      contestId,
      applicationDateRange,
      letterUploadDateRange,
      designReportDateRange,
      techControlsDateRange,
      finalRaceDateRange
    );
    return redirect(route("/contest/:contestId", { contestId: String(id) }));
  } else {
    console.error(parseResult.error);
    const { fieldErrors } = parseResult.error.flatten();
    return json<ActionData>(fieldErrors, {
      status: 400,
    });
  }
};

export default function Settings() {
  const { contest } = useLoaderData<Jsonify<LoaderData>>();
  const actionData = useActionData<ActionData>();

  return (
    <Stack>
      <Title order={3}>Change contest details</Title>

      <Form method="post">
        <DateRangePicker
          label="Application and progress report"
          required
          autoFocus
          name="applicationDateRange"
          error={actionData?.applicationDateRange?.[0]}
          defaultValue={[
            new Date(contest?.applicationStart),
            new Date(contest?.applicationEnd),
          ]}
        />

        <DateRangePicker
          label="Letters of commitment and consent upload"
          required
          name="letterUploadDateRange"
          error={actionData?.letterUploadDateRange?.[0]}
          defaultValue={[
            new Date(contest?.letterUploadStart),
            new Date(contest?.letterUploadEnd),
          ]}
        />

        <DateRangePicker
          label="Technical design report"
          required
          name="designReportDateRange"
          error={actionData?.designReportDateRange?.[0]}
          defaultValue={[
            new Date(contest?.designReportStart),
            new Date(contest?.designReportEnd),
          ]}
        />

        <DateRangePicker
          label="Technical controls"
          required
          name="techControlsDateRange"
          error={actionData?.techControlsDateRange?.[0]}
          defaultValue={[
            new Date(contest?.techControlsStart),
            new Date(contest?.techControlsEnd),
          ]}
        />

        <DateRangePicker
          label="Final races"
          required
          name="finalRaceDateRange"
          error={actionData?.finalRaceDateRange?.[0]}
          defaultValue={[
            new Date(contest?.finalRaceStart),
            new Date(contest?.finalRaceEnd),
          ]}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </Form>
    </Stack>
  );
}
