import {
  Anchor,
  Badge,
  Group,
  LoadingOverlay,
  Menu,
  Table,
  Text,
} from "@mantine/core";
import { useId } from "@mantine/hooks";
import type { Team, User } from "@prisma/client";
import { useSubmit } from "@remix-run/react";
import { route } from "routes-gen";
import type { getTeam, Responsibility } from "~/models/team.server";
import { useLoading } from "~/utils/hooks";
import type { Jsonify } from "~/utils/jsonify";

type Props = {
  members: Jsonify<NonNullable<Awaited<ReturnType<typeof getTeam>>>["members"]>;
};

export default function TeamMembers({ members }: Props) {
  const loading = useLoading((transiton) => {
    const method = transiton.submission?.method;
    return method === "POST" || method === "DELETE";
  });
  const id = useId();
  const submit = useSubmit();

  function action(teamId: Team["id"]) {
    return route("/team/:teamId/members", { teamId: String(teamId) });
  }

  function actionHandler(
    action: string,
    userId: User["id"],
    responsibility: Responsibility
  ) {
    return () => {
      submit(
        { responsibility, userId: String(userId) },
        { method: "post", action }
      );
    };
  }

  const rows = members.map((member) => (
    <tr key={member.userId} aria-labelledby={id}>
      <td>
        <Group spacing="sm">
          <Text size="sm" weight={500}>
            {member.user.fullName}
          </Text>
        </Group>
      </td>

      <td id={id}>
        <Anchor component="a" size="sm" href={`mailto:${member.user.email}`}>
          {member.user.email}
        </Anchor>
      </td>

      <td>
        <Group spacing="xs">
          <Badge size="xs">{member.user.role}</Badge>
          {member.isCaptain && <Badge size="xs">Captain</Badge>}
          {member.pilotingResponsibility && (
            <Badge size="xs">{member.pilotingResponsibility}</Badge>
          )}
        </Group>
      </td>

      <td>
        <Group spacing={0} position="right">
          <Menu menuButtonLabel="team member actions">
            <Menu.Item
              onClick={actionHandler(
                action(member.teamId),
                member.userId,
                "captain"
              )}
            >
              Assign captain
            </Menu.Item>
            <Menu.Item
              onClick={actionHandler(
                action(member.teamId),
                member.userId,
                "pilot"
              )}
            >
              Assign pilot
            </Menu.Item>
            <Menu.Item
              onClick={actionHandler(
                action(member.teamId),
                member.userId,
                "copilot"
              )}
            >
              Assign copilot
            </Menu.Item>
            <Menu.Item
              onClick={() =>
                submit(
                  { userId: String(member.userId) },
                  {
                    method: "delete",
                    action: action(member.teamId),
                  }
                )
              }
              color="red"
            >
              Remove from team
            </Menu.Item>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  if (members.length === 0) {
    return <Text>No members</Text>;
  } else {
    return (
      <Table
        verticalSpacing="sm"
        sx={{ position: "relative" }}
        aria-label="Team members"
      >
        <LoadingOverlay visible={loading} />
        <thead>
          <tr>
            <th>Member name</th>
            <th>Email</th>
            <th>Roles</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}
