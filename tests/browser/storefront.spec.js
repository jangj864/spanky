import { test, expect } from "@playwright/test";

test("Collection search, options, persistent cross-page bag and demo order", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".product")).toHaveCount(7);
  await page.locator("#search").fill("lime");
  await expect(page.locator(".product")).toHaveCount(1);
  await page.locator("#search").fill("no such design");
  await expect(page.locator("#noResults")).toBeVisible();
  await page.locator("#resetFilters").click();
  await expect(page.locator(".product")).toHaveCount(7);
  await page.locator('[data-product="7"]').first().click();
  await page.locator('[data-size="L"]').click();
  await page.locator("#add").click();
  await page.goto("/about.html");
  await expect(page.locator("[data-cart-count]")).toHaveText("1");
  await page.locator("[data-open-cart]").click();
  await expect(page.locator(".cart-row")).toContainText("Bipolar");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.locator(".total")).toContainText("$30");
  await expect(page.locator("#cartContent")).not.toContainText(/type\s+d/i);
  await page.locator("#checkout").click();
  await page.locator('#orderForm button[type="submit"]').click();
  await expect(page.locator("#orderForm")).toBeVisible();
  for (const [name, value] of Object.entries({
    name: "Sample customer",
    email: "test@example.com",
    phone: "555-0100",
    zip: "10001",
    address: "Sample street",
  }))
    await page.locator(`[name="${name}"]`).fill(value);
  await page.locator('[type="checkbox"]').check();
  await page.locator('#orderForm button[type="submit"]').click();
  await expect(page.locator(".success")).toContainText("Demo order complete");
  await expect(page.locator("[data-cart-count]")).toHaveText("0");
  expect(errors).toEqual([]);
});

for (const route of ["index", "about", "world", "campaign", "packaging"]) {
  test(`${route}: shared mobile navigation, no overflow, bag and size guide`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${route}.html`);
    await expect(page.locator("body")).not.toContainText(/type\s+d/i);
    await page.locator(".menu-toggle").click();
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(
      page
        .locator("#site-nav")
        .getByRole("link", { name: "Explore", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".menu-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.locator("[data-open-cart]").click();
    await expect(page.locator("#cartContent")).toContainText("empty");
    await page.keyboard.press("Escape");
    await page.locator("#sizeGuide").click();
    await expect(page.locator("#infoContent")).toContainText("Waist");
  });
}

test("obsolete A–C products and malformed saved rows cannot enter the bag", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "spanky-cart",
      JSON.stringify([
        { id: 0, size: "M", qty: 1 },
        { id: 7, size: "M", qty: 2 },
        { id: 7, size: "XXL", qty: 1 },
      ]),
    ),
  );
  await page.goto("/");
  await expect(page.locator("[data-cart-count]")).toHaveText("2");
  await page.locator("[data-open-cart]").click();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await expect(page.locator(".cart-row")).toContainText("Bipolar");
});
