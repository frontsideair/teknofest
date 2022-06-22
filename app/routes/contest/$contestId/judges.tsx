import {
  Anchor,
  Button,
  Group,
  LoadingOverlay,
  Menu,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useId } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import {
  getContest,
  regenerateInviteCode,
  removeJudgeFromContest,
} from "~/models/contest.server";
import { requireRole } from "~/session.server";
import { getBaseUrl } from "~/utils/common";
import { useLoading } from "~/utils/hooks";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = {
  contest: NonNullable<Awaited<ReturnType<typeof getContest>>>;
  baseUrl: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "admin");
  const baseUrl = getBaseUrl();
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>({ baseUrl, contest });
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "admin");

  switch (request.method) {
    case "PUT": {
      await regenerateInviteCode(contestId);
      return redirect(
        route("/contest/:contestId/judges", { contestId: String(contestId) })
      );
    }
    case "DELETE": {
      const formData = await request.formData();
      const userId = numericString.parse(formData.get("userId"));
      await removeJudgeFromContest(userId, contestId);
      return redirect(
        route("/contest/:contestId/judges", { contestId: String(contestId) })
      );
    }
    default: {
      throw new Response("Method not allowed", { status: 405 });
    }
  }
};

export default function Judges() {
  const { contest, baseUrl } = useLoaderData<Jsonify<LoaderData>>();
  const loading = useLoading((transiton) => {
    return transiton.submission?.method === "DELETE";
  });
  const id = useId();
  const submit = useSubmit();
  const inviteLink = `${baseUrl}/contest/join?inviteCode=${contest.inviteCode}`;

  const rows = contest.judges.map((judge) => (
    <tr key={judge.user.id} aria-labelledby={id}>
      <td id={id}>
        <Anchor component="a" size="sm" href={`mailto:${judge.user.email}`}>
          {judge.user.fullName}
        </Anchor>
      </td>

      <td>
        <Group spacing={0} position="right">
          <Menu menuButtonLabel="team member actions">
            <Menu.Item
              onClick={() => {
                submit(
                  { userId: String(judge.userId) },
                  {
                    method: "delete",
                    action: route("/contest/:contestId/judges", {
                      contestId: String(contest.id),
                    }),
                  }
                );
              }}
              color="red"
            >
              Remove from contest
            </Menu.Item>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  return (
    <Stack>
      <Title order={3}>Judges</Title>
      {rows.length === 0 ? (
        <Text>No judges</Text>
      ) : (
        <Table
          verticalSpacing="sm"
          sx={{ position: "relative" }}
          aria-label="Teams"
        >
          <LoadingOverlay visible={loading} />
          <thead>
            <tr>
              <th>Name</th>
              <th />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}

      <Title order={3}>Invite judges</Title>
      <Text>
        Use the invite link to{" "}
        <Anchor
          href={`mailto:judge@example.com?subject=Join as as judge to ${contest.name} in Teknofest&body=Use the invite link ${inviteLink} to join.`}
        >
          invite judges
        </Anchor>{" "}
        to the contest.
      </Text>

      <Prism language="markup">{inviteLink}</Prism>
      <Form method="put">
        <Button type="submit">Regenerate invite code</Button>
      </Form>
    </Stack>
  );
}
