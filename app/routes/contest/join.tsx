import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Response } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { requireRole } from "~/session.server";
import { route } from "routes-gen";
import { Button, Container, Text, Title } from "@mantine/core";
import type { Contest } from "@prisma/client";
import type { Jsonify } from "~/utils/jsonify";
import { inviteCodeSchema } from "~/utils/zod";
import { getContestByInvite, addJudgeToContest } from "~/models/contest.server";

type LoaderData = { inviteCode: string; contestName: Contest["name"] };

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const inviteCode = inviteCodeSchema.parse(url.searchParams.get("inviteCode"));
  const user = await requireRole(request, "judge", route("/register"));
  const contest = await getContestByInvite(inviteCode);

  if (contest && !contest.judges.some((judge) => judge.userId === user.id)) {
    return json<LoaderData>({ inviteCode, contestName: contest.name });
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireRole(request, "judge");
  const formData = await request.formData();
  const inviteCode = inviteCodeSchema.parse(formData.get("inviteCode"));
  const contest = await getContestByInvite(inviteCode);

  if (contest) {
    await addJudgeToContest(user.id, contest.id);
    return redirect(route("/dashboard"));
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Become a judge for ${data?.contestName}`,
  };
};

export default function JoinTeam() {
  const { contestName, inviteCode } = useLoaderData<Jsonify<LoaderData>>();

  return (
    <Container size="xs">
      <Title order={2}>Becone a judge for {contestName}</Title>
      <Text>You were invited to judge {contestName}. Do you want to join?</Text>
      <Form method="post">
        <Button type="submit" name="inviteCode" value={inviteCode}>
          Join
        </Button>
      </Form>
    </Container>
  );
}
