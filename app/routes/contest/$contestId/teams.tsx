import {
  Anchor,
  Group,
  LoadingOverlay,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useId } from "@mantine/hooks";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { route } from "routes-gen";
import { getContest } from "~/models/contest.server";
import { requireRole } from "~/session.server";
import { useLoading } from "~/utils/hooks";
import type { Jsonify } from "~/utils/jsonify";
import { numericString } from "~/utils/zod";

type LoaderData = NonNullable<Awaited<ReturnType<typeof getContest>>>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const contestId = numericString.parse(params.contestId);
  await requireRole(request, "judge");
  const contest = await getContest(contestId);
  if (contest) {
    return json<LoaderData>(contest);
  } else {
    throw new Response("Not found", { status: 404 });
  }
};

export default function Teams() {
  const contest = useLoaderData<Jsonify<LoaderData>>();
  const loading = useLoading();
  const id = useId();

  const rows = contest.teams.map((team) => (
    <tr key={team.id} aria-labelledby={id}>
      <td>
        <Group spacing="sm">
          <Anchor
            component={Link}
            to={route("/team/:teamId", { teamId: String(team.id) })}
            size="sm"
            weight={500}
          >
            {team.name}
          </Anchor>
        </Group>
      </td>

      <td id={id}>
        <Anchor component="a" size="sm" href={`mailto:${team.advisor.email}`}>
          {team.advisor.fullName}
        </Anchor>
      </td>
    </tr>
  ));

  return (
    <Stack>
      <Title order={3}>Teams</Title>
      {rows.length === 0 ? (
        <Text>No teams</Text>
      ) : (
        <Table
          verticalSpacing="sm"
          sx={{ position: "relative" }}
          aria-label="Teams"
        >
          <LoadingOverlay visible={loading} />
          <thead>
            <tr>
              <th>Team name</th>
              <th>Advisor</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </Stack>
  );
}
