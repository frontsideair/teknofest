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

type Props = {
  members: NonNullable<Awaited<ReturnType<typeof getTeam>>>["members"];
};

export default function TeamMembers({ members }: Props) {
  const loading = useLoading(/^\/team\/\d+\/\d+$/);
  const id = useId();
  const submit = useSubmit();

  function action(userId: User["id"], teamId: Team["id"]) {
    return route("/team/:teamId/:userId", {
      teamId: String(teamId),
      userId: String(userId),
    });
  }

  function actionHandler(action: string, responsibility: Responsibility) {
    return () => {
      submit({ responsibility }, { method: "post", action });
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
                action(member.userId, member.teamId),
                "captain"
              )}
            >
              Assign captain
            </Menu.Item>
            <Menu.Item
              onClick={actionHandler(
                action(member.userId, member.teamId),
                "pilot"
              )}
            >
              Assign pilot
            </Menu.Item>
            <Menu.Item
              onClick={actionHandler(
                action(member.userId, member.teamId),
                "copilot"
              )}
            >
              Assign copilot
            </Menu.Item>
            <Menu.Item
              onClick={() =>
                submit(null, {
                  method: "delete",
                  action: action(member.userId, member.teamId),
                })
              }
            >
              <Text color="red">Remove from team</Text>
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
