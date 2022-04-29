import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import LogoutButton from "~/components/LogoutButton";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return <div>hello {user?.email ?? "guest"}!</div>;
}
