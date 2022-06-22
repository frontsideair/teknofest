import { Box, Container, Stack, Title } from "@mantine/core";
import type { getTeams } from "~/models/team.server";

type Props = {
  teams: Awaited<ReturnType<typeof getTeams>>;
};

export default function AdvisorDashboard({ teams }: Props) {
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
