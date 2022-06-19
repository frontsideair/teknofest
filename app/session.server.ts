import {
  createCookieSessionStorage,
  redirect,
  Response,
} from "@remix-run/node";
import { route } from "routes-gen";
import { z } from "zod";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

const SESSION_SECRET = z
  .string({ required_error: "SESSION_SECRET must be set" })
  .parse(process.env.SESSION_SECRET);

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const REDIRECT_BACK_KEY = "redirectBack";

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
    const session = await sessionStorage.getSession();
    session.flash(REDIRECT_BACK_KEY, request.url);
    throw redirect(redirectTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
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

function isPrivileged(userRole: User["role"], targetRole: User["role"]) {
  switch (userRole) {
    case "admin": {
      return true;
    }
    case "advisor": {
      return targetRole === "advisor" || targetRole === "student";
    }
    case "student": {
      return targetRole === "student";
    }
    default: {
      return false;
    }
  }
}

export async function requireRole(request: Request, role: User["role"]) {
  const user = await requireUser(request);

  if (!isPrivileged(user.role, role)) {
    throw new Response(" You are not authorized to see this page", {
      status: 401,
    });
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
  const redirectBack: string = session.get(REDIRECT_BACK_KEY);
  return redirect(redirectBack ?? route("/dashboard"), {
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
  session.unset(USER_SESSION_KEY);
  return redirect(route("/"), {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
