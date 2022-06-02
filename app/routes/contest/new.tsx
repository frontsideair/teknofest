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
});

type ActionData = z.inferFlattenedErrors<typeof formSchema>["fieldErrors"];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const parseResult = formSchema.safeParse(Object.fromEntries(formData));
  if (parseResult.success) {
    const { id } = await createContest(
      parseResult.data.applicationDateRange.start,
      parseResult.data.applicationDateRange.end
    );
    return redirect(route("/contest/:contestId", { contestId: String(id) }));
  } else {
    console.error(parseResult.error);
    return json<ActionData>(
      { applicationDateRange: ["Date range is required"] },
      { status: 400 }
    );
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
          label="Application date range"
          required
          autoFocus
          name="applicationDateRange"
          error={actionData?.applicationDateRange}
        />

        <Group position="right" mt="md">
          <Button type="submit">Create</Button>
        </Group>
      </Form>
    </Container>
  );
}
