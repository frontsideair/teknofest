import { Box, Container, Group, Title } from "@mantine/core";
import { Outlet } from "@remix-run/react";
import { route } from "routes-gen";
import Sidebar, { SidebarItem } from "~/components/Sidebar";

export default function Profile() {
  const links = [
    {
      to: route("/profile"),
      label: "Overview",
    },
    {
      to: route("/profile/change-details"),
      label: "Change details",
    },
    {
      to: route("/profile/change-email"),
      label: "Change email",
    },
    {
      to: route("/profile/change-password"),
      label: "Change password",
    },
  ];

  return (
    <Container size="sm">
      <Title order={2}>Profile</Title>
      <Group noWrap align="flex-start" mt="md">
        <Sidebar>
          {links.map((link, index) => (
            <SidebarItem key={index} link={link} />
          ))}
        </Sidebar>
        <Box style={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Group>
    </Container>
  );
}
