import {
  Button,
  Group,
  InputWrapper,
  RangeSlider,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { z } from "zod";
import DateRangePicker from "~/components/DateRangePicker";
import { getContest, nameSchema, updateContest } from "~/models/contest.server";
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
  name: nameSchema,
  teamSize_from: numericString,
  teamSize_to: numericString,
  teamNameLength_from: numericString,
  teamNameLength_to: numericString,
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
      name,
      teamSize_from,
      teamSize_to,
      teamNameLength_from,
      teamNameLength_to,
      applicationDateRange,
      letterUploadDateRange,
      designReportDateRange,
      techControlsDateRange,
      finalRaceDateRange,
    } = parseResult.data;
    const { id } = await updateContest(
      contestId,
      name,
      [teamSize_from, teamSize_to],
      [teamNameLength_from, teamNameLength_to],
      applicationDateRange,
      letterUploadDateRange,
      designReportDateRange,
      techControlsDateRange,
      finalRaceDateRange
    );
    return redirect(
      route("/contest/:contestId/settings", { contestId: String(id) })
    );
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
        <TextInput
          label="Contest name"
          placeholder="Teknofest 2022"
          required
          autoFocus
          name="name"
          error={actionData?.name}
          defaultValue={contest.name}
        />

        <InputWrapper
          label="Team size"
          description="Note: Changing this after teams are created can cause them to become invalid"
          required
        >
          <RangeSlider
            name="teamSize"
            min={1}
            max={32}
            minRange={1}
            defaultValue={[contest.minTeamSize, contest.maxTeamSize]}
            labelAlwaysOn
            mt={36}
          />
        </InputWrapper>

        <InputWrapper
          label="Team name length"
          description="Note: Changing this after teams have members can cause them to become invalid"
          required
        >
          <RangeSlider
            name="teamNameLength"
            min={1}
            max={64}
            minRange={1}
            defaultValue={[
              contest.minTeamNameLength,
              contest.maxTeamNameLength,
            ]}
            labelAlwaysOn
            mt={36}
          />
        </InputWrapper>

        <DateRangePicker
          label="Application and progress report"
          required
          name="applicationDateRange"
          error={actionData?.applicationDateRange?.[0]}
          placeholder="June 1, 2022 ??? June 30, 2022"
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
          placeholder="July 1, 2022 ??? July 5, 2022"
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
          placeholder="July 6, 2022 ??? July 20, 2022"
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
          placeholder="July 21, 2022 ??? July 26, 2022"
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
          placeholder="July 27, 2022 ??? July 28, 2022"
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
