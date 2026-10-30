import { expect, test } from "@playwright/test";

test("shows the user demo code under the access field and rejects a wrong code", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Choose a role and step onto the runway." })).toBeVisible();
  await expect(page.getByLabel("Sign in as")).toHaveValue("user");
  await expect(page.getByText("TESTUSER")).toBeVisible();

  await page.getByRole("button", { name: "Fill" }).click();
  await expect(page.getByLabel("Access code")).toHaveValue("TESTUSER");

  await page.getByLabel("Access code").fill("not-the-code");
  await page.getByRole("button", { name: "Sign in as User" }).click();
  await expect(page.getByRole("alert")).toContainText("not correct for the User role");
});

test("signs in as a user, keeps the session, and logs out", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Fill" }).click();
  await page.getByRole("button", { name: "Sign in as User" }).click();

  await expect(page).toHaveURL(/\/issue$/);
  await expect(page.getByRole("button", { name: "User account menu" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("button", { name: "User account menu" })).toBeVisible();

  await page.getByRole("button", { name: "User account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
});

test("an admin sign-in opens the read-only console", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Sign in as").selectOption("admin");
  await expect(page.getByText("Admin access uses the administrator password configured for this deployment.")).toBeVisible();
  await page.getByLabel("Access code").fill("STUDYADMIN");
  await page.getByRole("button", { name: "Sign in as Admin" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "A quiet operations view." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Live model path" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Admin account menu" })).toBeVisible();
});

test("redirects signed-out visitors away from the admin console", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=(?:%2F|\/)admin$/);
  await expect(page.getByRole("heading", { name: "Choose a role and step onto the runway." })).toBeVisible();
});
