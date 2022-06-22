import {
  Button,
  Container,
  Group,
  InputWrapper,
  RangeSlider,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { z } from "zod";
import { createContest, nameSchema } from "~/models/contest.server";
import { dateRangeString, numericString } from "~/utils/zod";
import { requireRole } from "~/session.server";
import DateRangePicker from "~/components/DateRangePicker";

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

export const action: ActionFunction = async ({ request }) => {
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
    const { id } = await createContest(
      name,
      [teamSize_from, teamSize_to],
      [teamNameLength_from, teamNameLength_to],
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

export const meta: MetaFunction = () => {
  return {
    title: "Create new contest",
  };
};

export default function NewContest() {
  const actionData = useActionData<ActionData>();

  return (
    <Container size="sm">
      <Title order={2}>Create new contest</Title>
      <Form method="post" action="/contest/new">
        <TextInput
          label="Contest name"
          placeholder="Teknofest 2022"
          required
          autoFocus
          name="name"
          error={actionData?.name}
        />

        <Group>
          <InputWrapper
            label="Team size"
            description="A team must have number of members within these bounds"
            required
          >
            <RangeSlider
              name="teamSize"
              min={1}
              max={32}
              minRange={1}
              defaultValue={[5, 15]}
              labelAlwaysOn
              mt={36}
            />
          </InputWrapper>

          <InputWrapper
            label="Team name length"
            description="Advisor must choose a team name within these bounds"
            required
          >
            <RangeSlider
              name="teamNameLength"
              min={1}
              max={64}
              minRange={1}
              defaultValue={[1, 10]}
              labelAlwaysOn
              mt={36}
            />
          </InputWrapper>
        </Group>

        <DateRangePicker
          label="Application and progress report"
          required
          name="applicationDateRange"
          error={actionData?.applicationDateRange?.[0]}
        />

        <DateRangePicker
          label="Letters of commitment and consent upload"
          required
          name="letterUploadDateRange"
          error={actionData?.letterUploadDateRange?.[0]}
        />

        <DateRangePicker
          label="Technical design report"
          required
          name="designReportDateRange"
          error={actionData?.designReportDateRange?.[0]}
        />

        <DateRangePicker
          label="Technical controls"
          required
          name="techControlsDateRange"
          error={actionData?.techControlsDateRange?.[0]}
        />

        <DateRangePicker
          label="Final races"
          required
          name="finalRaceDateRange"
          error={actionData?.finalRaceDateRange?.[0]}
        />

        <Group position="right" mt="md">
          <Button type="submit">Create</Button>
        </Group>
      </Form>
    </Container>
  );
}
