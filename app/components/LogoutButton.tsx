import { Form } from "@remix-run/react";
import { Button } from "@mantine/core";

export default function LogoutButton() {
  return (
    <Form action="/logout" method="post">
      <Button type="submit">Logout</Button>
    </Form>
  );
}
