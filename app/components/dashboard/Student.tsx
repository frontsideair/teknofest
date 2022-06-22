import { Box, Container, Stack, Title } from "@mantine/core";
import { useLoaderData } from "@remix-run/react";
import { getTeams } from "~/models/team.server";
import type { User } from "~/models/user.server";
import type { Jsonify } from "~/utils/jsonify";

type LoaderData = {
  teams: Awaited<ReturnType<typeof getTeams>>;
};

export const loader = async (userId: User["id"]) => {
  const teams = await getTeams(userId);
  return { teams };
};

export default function AdvisorDashboard() {
  const { teams } = useLoaderData<Jsonify<LoaderData>>();

  return (
    <Container size="sm">
      <Title order={2}>Student Dashboard</Title>
      <Title order={3}>Teams</Title>
      <Box component="ol">
        <Stack>
          {teams.map((team) => (
            <Box key={team.id} component="li">
              {team.name}
            </Box>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
