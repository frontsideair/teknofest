import type { Locator, Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";

type Role = "admin" | "advisor" | "student";

type User = {
  fullName: string;
  email: string;
  password: string;
  role: Role;
};

export class TeknofestPage {
  readonly page: Page;
  readonly header: Locator;
  readonly main: Locator;
  readonly heading: Locator;
  readonly users: Record<Role, User> = {
    admin: {
      fullName: "Admin",
      email: "admin@teknofest.org",
      password: "teknofestadmin",
      role: "admin",
    },
    advisor: {
      fullName: "Fatih Altinok",
      email: "fatih@gazi.edu.tr",
      password: "fatihpassword",
      role: "advisor",
    },
    student: {
      fullName: "John Doe",
      email: "student@school.k12.tr",
      password: "studentpassword",
      role: "student",
    },
  };
  readonly teamName = "BEST TEAM";

  userAssertion(user: User) {
    switch (user.role) {
      case "admin":
        return /admin dashboard/i;
      case "advisor":
        return /advisor dashboard/i;
      case "student":
        return /student dashboard/i;
    }
  }

  constructor(page: Page) {
    this.page = page;
    this.header = this.page.locator("role=navigation");
    this.main = this.page.locator("role=main");
    this.heading = this.main.locator("role=heading[level=2]");
  }

  goto(page: "home" | "login" | "dashboard" | string) {
    switch (page) {
      case "home":
        return this.page.goto("/");
      case "login":
        return this.page.goto("/login");
      case "dashboard":
        return this.page.goto("/dashboard");
      default:
        return this.page.goto(page);
    }
  }

  submit() {
    return this.page.keyboard.press("Enter");
  }

  async login(user: User) {
    await this.goto("login");
    await this.main
      .locator("role=textbox[name=/email address/i]")
      .type(user.email);
    await this.main
      .locator("role=textbox[name=/password/i]")
      .type(user.password);
    await this.submit();
    await expect(this.heading).toHaveText(this.userAssertion(user));
  }

  async register(user: User) {
    await this.main
      .locator("role=textbox[name=/full name/i]")
      .type(user.fullName);
    await this.main
      .locator("role=textbox[name=/email address/i]")
      .type(user.email);
    await this.main
      .locator("role=textbox[name=/password/i]")
      .type(user.password);
    await this.main
      .locator(
        `role=radiogroup[name=/role/i] >> role=radio[name=/${user.role}/i]`
      )
      .click();
    await this.submit();
  }

  async pickDate(day: number) {
    return await this.page
      .locator(`role=table >> role=cell[name=${day}]`)
      .first()
      .click();
  }

  async pickMenuItem(text: string) {
    await this.page
      .locator(`role=menu >> role=menuitem[name=/${text}/i]`)
      .click();
  }
}

const test = base.extend<{ tf: TeknofestPage }>({
  tf: async ({ page }, use) => {
    const tf = new TeknofestPage(page);
    await use(tf);
  },
});

test.describe("Admin flow", () => {
  test("should allow admin to login and create contest", async ({ tf }) => {
    await tf.goto("home");
    await tf.header.locator("role=link[name=/login/i]").click();
    await tf.main
      .locator("role=textbox[name=/email address/i]")
      .type(tf.users.admin.email);
    await tf.main
      .locator("role=textbox[name=/password/i]")
      .type(tf.users.admin.password);
    await tf.submit();
    await expect(tf.heading).toHaveText(/admin dashboard/i);

    await tf.goto("dashboard");
    await tf.main.locator("role=link[name=/create new contest/i]").click();
    await expect(tf.heading).toHaveText(/create new contest/i);

    await tf.main
      .locator("role=textbox[name=/application date range/i]")
      .click();
    await tf.pickDate(1);
    await tf.pickDate(15);
    await tf.main.locator("role=button[name=/create/i]").click();
    await expect(tf.heading).toHaveText(/^contest/i);
  });
});

test.describe("Advisor flow", () => {
  test("should allow advisor to register", async ({ tf }) => {
    await tf.goto("home");
    await tf.header.locator("role=link[name=/register/i]").click();
    await tf.register(tf.users.advisor);
    await expect(tf.heading).toHaveText(tf.userAssertion(tf.users.advisor));
  });

  test("should allow advisor to login and create team", async ({ tf }) => {
    await tf.login(tf.users.advisor);

    await tf.main.locator("role=link[name=/create new team/i]").click();
    await expect(tf.heading).toHaveText(/create new team/i);

    await tf.main.locator("role=textbox[name=/team name/i]").type(tf.teamName);
    await tf.main.locator("role=button[name=/create/i]").click();
    await expect(tf.heading).toContainText(tf.teamName);
  });

  let inviteLink: string | null = null;

  test("should allow advisor to invite members", async ({ tf }) => {
    await tf.login(tf.users.advisor);
    await tf.main
      .locator("role=article", { hasText: tf.teamName })
      .locator("role=link[name=/edit team/i]")
      .click();
    await expect(tf.heading).toContainText(tf.teamName);

    inviteLink = await tf.main.locator("text=/inviteCode/").textContent();
  });

  test("should allow invited member to register", async ({ tf }) => {
    test.skip(inviteLink === null, "No invite link generated");
    await tf.goto(inviteLink!);
    await tf.register(tf.users.student);

    await expect(tf.heading).toHaveText(/join team/i);

    await tf.main.locator("role=button[name=/join/i]").click();
    await expect(tf.heading).toHaveText(/student dashboard/i);
    await expect(tf.main.locator("role=list >> role=listitem")).toContainText(
      tf.teamName
    );
  });

  test("should allow advisor to remove member from team", async ({ tf }) => {
    await tf.login(tf.users.advisor);
    await tf.goto("/team/1");

    await tf.main
      .locator("role=table[name=/team members/i]")
      .locator(`role=row[name=/${tf.users.student.email}/i]`)
      .locator("role=button[name=/team member actions/i]")
      .click();
    await tf.pickMenuItem("remove from team");
    await expect(tf.main).not.toContainText(tf.users.student.email);
  });
});
