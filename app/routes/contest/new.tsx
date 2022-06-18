import { Button, Container, Group, Title } from "@mantine/core";
import { DateRangePicker } from "@mantine/dates";
import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { z } from "zod";
import { createContest } from "~/models/contest.server";
import { dateRangeString } from "~/utils/zod";

const formSchema = z.object({
  applicationDateRange: dateRangeString,
  letterUploadDateRange: dateRangeString,
  designReportDateRange: dateRangeString,
  techControlsDateRange: dateRangeString,
  finalRaceDateRange: dateRangeString,
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
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
    const { id } = await createContest(
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
        <DateRangePicker
          label="Application and progress report"
          required
          autoFocus
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
