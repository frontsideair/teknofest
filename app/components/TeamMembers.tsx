import {
  Anchor,
  Badge,
  Group,
  LoadingOverlay,
  Menu,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useId } from "@mantine/hooks";
import type { User } from "@prisma/client";
import { Form, useTransition } from "@remix-run/react";

type Props = {
  users: User[];
};

export default function TeamMembers({ users }: Props) {
  const transition = useTransition();
  const id = useId();

  const rows = users.map((user) => (
    <tr key={user.id} aria-labelledby={id}>
      <td>
        <Group spacing="sm">
          <Text size="sm" weight={500}>
            {user.fullName}
          </Text>
        </Group>
      </td>

      <td>
        <Badge>{user.role}</Badge>
      </td>
      <td id={id}>
        <Anchor component="a" size="sm" href={`mailto:${user.email}`}>
          {user.email}
        </Anchor>
      </td>
      <td>
        <Group spacing={0} position="right">
          <Menu menuButtonLabel="team member actions">
            <Menu.Item>
              <Form method="delete">
                <UnstyledButton type="submit" name="userId" value={user.id}>
                  Remove from team
                </UnstyledButton>
              </Form>
            </Menu.Item>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  if (users.length === 0) {
    return <Text>No members</Text>;
  } else {
    return (
      <Table
        verticalSpacing="sm"
        sx={{ position: "relative" }}
        aria-label="Team members"
      >
        <LoadingOverlay visible={transition.state !== "idle"} />
        <thead>
          <tr>
            <th>Member name</th>
            <th>Role</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}
