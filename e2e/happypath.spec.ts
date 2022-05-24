import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";

const LOCATORS = {
  pageHeader: "role=main >> role=heading[level=2]",
};

type Role = "admin" | "advisor" | "student";

type User = {
  email: string;
  password: string;
  role: Role;
};

const users: Record<Role, User> = {
  admin: {
    email: "admin@teknofest.org",
    password: "teknofestadmin",
    role: "admin",
  },
  advisor: {
    email: "fatih@gazi.edu.tr",
    password: "fatihpassword",
    role: "advisor",
  },
  student: {
    email: "student@school.k12.tr",
    password: "studentpassword",
    role: "student",
  },
};

const teamName = "BEST TEAM";

test.describe("Admin flow", () => {
  test("should allow admin to login and create contest", async ({ page }) => {
    await page.goto("/");
    await page.locator("role=navigation >> role=link[name=/login/i]").click();
    await page
      .locator("role=main >> role=textbox[name=/email address/i]")
      .type(users.admin.email);
    await page
      .locator("role=main >> role=textbox[name=/password/i]")
      .type(users.admin.password);
    await page.keyboard.press("Enter");
    await expect(page.locator(LOCATORS.pageHeader)).toHaveText(
      /admin dashboard/i
    );

    await page.goto("/dashboard");
    await page
      .locator("role=main >> role=link[name=/create new contest/i]")
      .click();
    await page
      .locator("role=main >> role=textbox[name=/application date range/i]")
      .click();
    await page.locator("role=table >> role=cell[name=1]").first().click();
    await page.locator("role=table >> role=cell[name=15]").click();
    await page.locator("role=main >> role=button[name=/create/i]").click();
    await expect(page.locator(LOCATORS.pageHeader)).toHaveText(/contest/i);
  });
});

test.describe("Advisor flow", () => {
  test("should allow advisor to register", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("role=navigation >> role=link[name=/register/i]")
      .click();
    await register(page, users.advisor, /advisor dashboard/i);
  });

  test("should allow advisor to login and create team", async ({ page }) => {
    await login(page, users.advisor, /advisor dashboard/i);

    await page
      .locator("role=main >> role=link[name=/create new team/i]")
      .click();
    await page
      .locator("role=main >> role=textbox[name=/team name/i]")
      .type(teamName);
    await page.locator("role=main >> role=button[name=/create/i]").click();
    await expect(page.locator(LOCATORS.pageHeader)).toContainText(teamName);
  });

  let inviteLink: string | null = null;

  test("should allow advisor to invite members", async ({ page }) => {
    await login(page, users.advisor, /advisor dashboard/i);
    await page
      .locator("role=main >> role=article", { hasText: teamName })
      .locator("role=link[name=/edit team/i]")
      .click();
    await expect(page.locator(LOCATORS.pageHeader)).toContainText(teamName);

    inviteLink = await page
      .locator("role=main >> text=/inviteCode/")
      .textContent();
  });

  test("should allow invited member to register", async ({ page }) => {
    test.skip(inviteLink === null, "No invite link generated");
    await page.goto(inviteLink!);
    await register(page, users.student, /student dashboard/i);

    await page.goto(inviteLink!);
    await expect(page.locator(LOCATORS.pageHeader)).toHaveText(/join team/i);

    await page.locator("role=main >> role=button[name=/join/i]").click();
    await expect(page.locator(LOCATORS.pageHeader)).toHaveText(
      /student dashboard/i
    );
    await expect(
      page.locator("role=main >> role=list >> role=listitem")
    ).toContainText(teamName);
  });

  test("should allow advisor to see member", async ({ page }) => {
    await login(page, users.advisor, /advisor dashboard/i);
    await page.goto("/team/1");

    await page
      .locator("role=main >> role=article", { hasText: users.student.email })
      .locator("role=button")
      .click();
    await page
      .locator("role=menu >> role=menuitem[name=/remove from team/i]")
      .click();
    await expect(page.locator("role=main")).not.toContainText(
      users.student.email
    );
  });
});

async function login(page: Page, user: User, assertion: RegExp = /dashboard/i) {
  await page.goto("/login");
  await page
    .locator("role=main >> role=textbox[name=/email address/i]")
    .type(user.email);
  await page
    .locator("role=main >> role=textbox[name=/password/i]")
    .type(user.password);
  await page.keyboard.press("Enter");
  await expect(page.locator(LOCATORS.pageHeader)).toHaveText(assertion);
}

async function register(
  page: Page,
  user: User,
  assertion: RegExp = /dashboard/i
) {
  await page
    .locator("role=main >> role=textbox[name=/email address/i]")
    .type(user.email);
  await page
    .locator("role=main >> role=textbox[name=/password/i]")
    .type(user.password);
  await page
    .locator(
      `role=main >> role=radiogroup[name=/role/i] >> role=radio[name=/${user.role}/i]`
    )
    .click();
  await page.keyboard.press("Enter");
  await expect(page.locator(LOCATORS.pageHeader)).toHaveText(assertion);
}
