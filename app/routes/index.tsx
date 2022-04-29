import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return <div>hello {user?.email ?? "guest"}!</div>;
}
