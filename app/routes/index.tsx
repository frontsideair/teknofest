import { Container } from "@mantine/core";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return <Container size="sm">hello {user?.email ?? "guest"}!</Container>;
}
