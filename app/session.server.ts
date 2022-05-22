import {
  createCookieSessionStorage,
  redirect,
  Response,
} from "@remix-run/node";
import { route } from "routes-gen";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = Number(session.get(USER_SESSION_KEY)) || undefined;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: ReturnType<typeof route> = route("/login")
) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect(redirectTo);
  }
  return userId;
}

export async function requireUser(
  request: Request,
  redirectTo: ReturnType<typeof route> = route("/login")
) {
  const userId = await requireUserId(request, redirectTo);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireAdvisor(request: Request) {
  const user = await requireUser(request);

  if (user.role !== "advisor") {
    throw new Response("Unauthorized", { status: 401 });
  } else {
    return user;
  }
}

export async function createUserSession({
  request,
  userId,
  remember,
}: {
  request: Request;
  userId: User["id"];
  remember: boolean;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, String(userId));
  return redirect(route("/dashboard"), {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect(route("/"), {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
