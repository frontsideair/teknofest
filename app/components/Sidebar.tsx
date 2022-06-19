import { createStyles, Navbar } from "@mantine/core";
import { NavLink } from "@remix-run/react";
import type { ReactNode } from "react";

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <Navbar px="md" width={{ sm: 240 }}>
      <Navbar.Section grow>{children}</Navbar.Section>
    </Navbar>
  );
}

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

type Link = {
  to: string;
  label: string;
};

export function SidebarItem({ link }: { link: Link }) {
  const { classes, cx } = useStyles();
  return (
    <NavLink
      end
      className={({ isActive }) =>
        cx(classes.link, {
          [classes.linkActive]: isActive,
        })
      }
      to={link.to}
    >
      {link.label}
    </NavLink>
  );
}
