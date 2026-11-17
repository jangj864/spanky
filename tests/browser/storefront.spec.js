import { test, expect } from "@playwright/test";

// External font CDN availability must not block local interaction tests.
test.beforeEach(async ({ page }) => {
  await page.route("https://cdn.jsdelivr.net/**", (route) => route.abort());
});

test("Collection search, options, persistent cross-page bag and demo order", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".product")).toHaveCount(11);
  await page.locator("#search").fill("lime");
  await expect(page.locator(".product")).toHaveCount(1);
  await page.locator("#search").fill("no such design");
  await expect(page.locator("#noResults")).toBeVisible();
  await page.locator("#resetFilters").click();
  await expect(page.locator(".product")).toHaveCount(11);
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

test("every product has a matching clickable back view that preserves size selection", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of [3, 7, 11, 15, 19, 23, 27]) {
    await page.locator(`[data-product="${id}"]`).first().click();
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "src",
      `assets/refresh-20261117/product-${(id - 3) / 4}-3.png`,
    );
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "src",
      `assets/refresh-20261117/product-${(id - 3) / 4}-back.png`,
    );
    await expect(
      page.getByRole("button", { name: "Back", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.locator("#detailPhoto").evaluate((image) => image.decode());
    await page.locator('[data-size="L"]').click();
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "alt",
      /back view/,
    );
    await expect(page.locator('[data-size="L"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page
      .getByRole("button", { name: "Show front view", exact: true })
      .click();
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "alt",
      /front view/,
    );
    await page.keyboard.press("Escape");
  }
});

test("Special Collection filters all four underground artist products and supports options and cart", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Special Collection", exact: true })
    .click();
  await expect(page.locator(".product")).toHaveCount(4);
  for (const id of [300, 301, 302, 303]) {
    await page.locator(`[data-product="${id}"]`).first().click();
    await expect(page.locator("#productDetail")).toContainText(
      "SPECIAL COLLECTION",
    );
    await page.getByRole("button", { name: "Back", exact: true }).click();
    const slug = ["eno", "chaemin", "stacey-nah", "velfont"][id - 300];
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "src",
      `assets/refresh-20261117/underground-${slug}-back.png`,
    );
    await expect(page.locator("#detailPhoto")).toHaveAttribute(
      "alt",
      /back view/,
    );
    await page.locator("#detailPhoto").evaluate((i) => i.decode());
    await page.locator('[data-size="L"]').click();
    await page.locator("#add").click();
  }
  await page.locator("[data-open-cart]").click();
  await expect(page.locator(".cart-row")).toHaveCount(4);
  await expect(page.locator(".total")).toContainText("$60");
});

for (const route of ["world", "campaign"]) {
  test(`${route}: image gallery cycles with indicators and keyboard`, async ({
    page,
  }) => {
    await page.goto(`/${route}.html`);
    const gallery = page.locator("[data-carousel]");
    await gallery
      .getByRole("button", { name: "Next image", exact: true })
      .click();
    await expect(gallery.locator("[data-slide]:visible")).toHaveAttribute(
      "src",
      "assets/refresh-20261117/party-new-york.png",
    );
    await gallery.locator("[data-slide]:visible").evaluate((i) => i.decode());
    await expect(gallery.locator('[data-indicator="1"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await gallery.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(gallery.locator("[data-slide-count]")).toHaveText("01 / 04");
    await gallery
      .getByRole("button", { name: "Show image 4", exact: true })
      .click();
    await expect(gallery.locator("[data-slide]:visible")).toHaveAttribute(
      "src",
      "assets/refresh-20261117/party-community.png",
    );
    await gallery.locator("[data-slide]:visible").evaluate((i) => i.decode());
    await gallery
      .getByRole("button", { name: "Show image 3", exact: true })
      .click();
    await expect(gallery.locator("[data-slide]:visible")).toHaveAttribute(
      "src",
      "assets/refresh-20261117/dj-underground.png",
    );
    await gallery.locator("[data-slide]:visible").evaluate((i) => i.decode());
  });
}

test("3D customization updates live and retains separate designs across pages", async ({
  page,
}) => {
  await page.goto("/customize.html");
  await expect(page.locator("#garmentViewport")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.locator('[name="band"]').fill("#ffffff");
  await page.locator('[name="pattern"][value="dots"]').check();
  await expect(page.locator("#garmentViewport")).toHaveAttribute(
    "data-design",
    /"band":"#ffffff"/,
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.locator("#addCustom").click();
  await expect(page.locator(".cart-row")).toContainText("DOTS");
  await page.keyboard.press("Escape");
  await page.locator('[name="band"]').fill("#171719");
  await page.locator("#addCustom").click();
  await expect(page.locator(".cart-row")).toHaveCount(2);
  await page.goto("/about.html");
  await page.locator("[data-open-cart]").click();
  await expect(page.locator(".cart-row")).toHaveCount(2);
  await expect(page.locator(".total")).toContainText("$30");
  await page.keyboard.press("Escape");
  await page.goto("/customize.html");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("back message and color controls update and persist safely", async ({
  page,
}) => {
  await page.goto("/customize.html");
  await expect(page.locator("#garmentViewport")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 30000 },
  );
  await page.locator("#backMessage").fill("still here. still me.");
  await expect(page.locator("#messageCount")).toHaveText("21 / 32");
  await expect(page.locator("#garmentViewport")).toHaveAttribute(
    "data-design",
    /still here. still me./,
  );
  await page.locator('[data-hex="logo"]').fill("#00ff00");
  await expect(page.locator('[name="logo"]')).toHaveValue("#00ff00");
  await page.locator("#addCustom").click();
  await expect(page.locator(".cart-row")).toContainText(
    "still here. still me.",
  );
  await page.goto("/about.html");
  await page.locator("[data-open-cart]").click();
  await expect(page.locator(".cart-row")).toContainText(
    "still here. still me.",
  );
});

test("About concept images retain original proportions at desktop and mobile sizes", async ({
  page,
}) => {
  await page.goto("/about.html");
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const images = page.locator(".concept-item img");
    await expect(images).toHaveCount(7);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((i) => i.decode());
      const box = await image.boundingBox();
      expect(Math.abs(box.width / box.height - 1.5)).toBeLessThan(0.02);
    }
  }
});

test("As You Feel leads the slogan pages without mobile overflow", async ({
  page,
}) => {
  for (const route of ["index", "about", "world", "campaign"]) {
    await page.goto(`/${route}.html`);
    await expect(page.locator("h1.brand-slogan")).toContainText("As You");
    await expect(page.locator("h1.brand-slogan")).toContainText("Feel");
    await expect(page.locator(".footer-lead")).toContainText("As You Feel");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
});

test("detail artwork stays inside a square frame for portrait and landscape images", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/index.html");
    for (const id of [3, 300, 301, 302, 303]) {
      await page.locator(`[data-product="${id}"]`).first().click();
      for (const view of ["Front", "Back"]) {
        await page.getByRole("button", { name: view, exact: true }).click();
        await page.locator("#detailPhoto").evaluate((i) => i.decode());
        const frame = await page.locator(".gallery-main").boundingBox();
        const image = await page.locator("#detailPhoto").boundingBox();
        expect(Math.abs(frame.width - frame.height)).toBeLessThan(1);
        expect(image.x).toBeGreaterThanOrEqual(frame.x - 1);
        expect(image.y).toBeGreaterThanOrEqual(frame.y - 1);
        expect(image.x + image.width).toBeLessThanOrEqual(
          frame.x + frame.width + 1,
        );
        expect(image.y + image.height).toBeLessThanOrEqual(
          frame.y + frame.height + 1,
        );
      }
      await page.keyboard.press("Escape");
    }
  }
});

test("core and collaboration cards use matching product display heights", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/index.html");
    const measurements = [];
    for (const id of [3, 27, 300, 301, 302, 303]) {
      const button = page.locator(
        `.product-image-button[data-product="${id}"]`,
      );
      await button.scrollIntoViewIfNeeded();
      const image = button.locator("img");
      await image.evaluate((i) => i.decode());
      const frame = await button.boundingBox(),
        box = await image.boundingBox();
      measurements.push(box.height / frame.height);
    }
    expect(Math.max(...measurements) - Math.min(...measurements)).toBeLessThan(
      0.005,
    );
  }
});
