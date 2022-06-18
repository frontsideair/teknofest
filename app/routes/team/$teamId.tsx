import {
  Box,
  Container,
  createStyles,
  Group,
  Navbar,
  Title,
} from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { getTeam } from "~/models/team.server";
import { requireRole } from "~/session.server";
import { numericString } from "~/utils/zod";

const useStyles = createStyles((theme, _params) => {
  return {
    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.fn.rgba(theme.colors[theme.primaryColor]![8], 0.25)
            : theme.colors[theme.primaryColor]![0],
        color:
          theme.colorScheme === "dark"
            ? theme.white
            : theme.colors[theme.primaryColor]![7],
      },
    },
  };
});

type LoaderData = {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const teamId = numericString.parse(params.teamId);
  await requireRole(request, "advisor");
  const team = await getTeam(teamId);
  if (team) {
    return json<LoaderData>({ team });
  } else {
    throw new Response("No such team found", { status: 404 });
  }
};

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Team ${data?.team?.name}`,
  };
};

export default function TeamPage() {
  const { team } = useLoaderData<LoaderData>();
  const { classes, cx } = useStyles();

  const links = [
    {
      to: route("/team/:teamId", { teamId: String(team.id) }),
      label: "Overview",
    },
    {
      to: route("/team/:teamId/members", { teamId: String(team.id) }),
      label: "Members",
    },
    {
      to: route("/team/:teamId/progress-report", { teamId: String(team.id) }),
      label: "Progress Report",
    },
    {
      to: route("/team/:teamId/settings", { teamId: String(team.id) }),
      label: "Settings",
    },
  ];

  return (
    <Container size="md">
      <Title order={2}>Team {team.name}</Title>
      <Group noWrap align="flex-start" mt="md">
        <Navbar px="md" width={{ sm: 240 }}>
          <Navbar.Section grow>
            {links.map((link, index) => (
              <NavLink
                end
                key={index}
                className={({ isActive }) =>
                  cx(classes.link, {
                    [classes.linkActive]: isActive,
                  })
                }
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </Navbar.Section>
        </Navbar>
        <Box style={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Group>
    </Container>
  );
}
