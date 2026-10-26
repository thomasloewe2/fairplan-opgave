import { expect, test } from "@playwright/test";

test("perioder kan oprettes, redigeres, søges og slettes", async ({ page }) => {
  await page.goto("/perioder");
  await expect(page.getByRole("heading", { name: "Perioder" })).toBeVisible();
  await expect(page.getByText("November 2026")).toBeVisible();

  await page.getByRole("button", { name: "+ Opret periode" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Navn").fill("UI-testperiode");
  await dialog.getByLabel("Startdato").fill("2028-01-01");
  await dialog.getByLabel("Slutdato").fill("2028-01-31");
  await dialog.getByRole("button", { name: "Gem periode" }).click();

  let row = page.getByRole("row", { name: /UI-testperiode/ });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Rediger" }).click();
  await dialog.getByLabel("Navn").fill("UI-testperiode redigeret");
  await dialog.getByRole("button", { name: "Gem periode" }).click();
  row = page.getByRole("row", { name: /UI-testperiode redigeret/ });
  await expect(row).toBeVisible();

  await page.getByRole("searchbox", { name: "Søg" }).fill("UI-testperiode redigeret");
  await expect(page.getByRole("row", { name: /November 2026/ })).toHaveCount(0);
  await row.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(page.getByRole("row", { name: /UI-testperiode redigeret/ })).toHaveCount(0);
});

test("organisering understøtter farvevalg, præcis HEX-kode og beskyttet sletning", async ({ page }) => {
  await page.goto("/organisering");
  await page.getByRole("button", { name: "+ Opret afsnit" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Afsnitsnavn").fill("UI-testafsnit");
  await dialog.getByLabel("HEX-farvekode").fill("#AABBCC");
  await expect(dialog.getByLabel("Vælg farve")).toHaveValue("#aabbcc");
  await dialog.getByRole("button", { name: "Gem afsnit" }).click();

  await page.getByRole("searchbox", { name: "Søg" }).fill("UI-testafsnit");
  let row = page.getByRole("row", { name: /UI-testafsnit/ });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Rediger" }).click();
  await dialog.getByLabel("Vælg farve").fill("#00ff88");
  await expect(dialog.getByLabel("HEX-farvekode")).toHaveValue("#00FF88");
  await dialog.getByRole("button", { name: "Gem afsnit" }).click();
  row = page.getByRole("row", { name: /UI-testafsnit/ });
  await expect(row).toContainText("#00FF88");
  await row.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(row).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Søg" }).fill("Akutafsnit");
  const seededRow = page.getByRole("row", { name: /Akutafsnit/ });
  await seededRow.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("tilknyttede ansættelser");
  await dialog.getByRole("button", { name: "Annuller" }).click();
});

test("bruger med ansættelse kan ikke slettes før ansættelsen", async ({ page }) => {
  await page.goto("/adgangsstyring/brugere");
  await page.getByRole("button", { name: "+ Opret bruger" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Fulde navn").fill("UI-testperson");
  await dialog.getByLabel("E-mail").fill("ui-person@example.test");
  await dialog.getByRole("button", { name: "Gem bruger" }).click();

  await page.getByRole("searchbox", { name: "Søg" }).fill("ui-person@example.test");
  await expect(page.getByRole("row", { name: /UI-testperson/ })).toBeVisible();
  await page.goto("/adgangsstyring/ansaettelser");
  await page.getByRole("button", { name: "+ Opret ansættelse" }).click();
  await dialog.getByLabel("Bruger").selectOption({ label: "UI-testperson (ui-person@example.test)" });
  await dialog.getByLabel("Afsnit").selectOption({ label: "Akutafsnit" });
  await dialog.getByLabel("Personalegruppe").selectOption({ label: "Læger" });
  await dialog.getByLabel("Startdato").fill("2029-01-01");
  await dialog.getByLabel("Slutdato").fill("2029-06-30");
  await dialog.getByRole("button", { name: "Gem ansættelse" }).click();
  await page.getByRole("searchbox", { name: "Søg" }).fill("UI-testperson");
  let employment = page.getByRole("row", { name: /UI-testperson/ });
  await expect(employment).toBeVisible();

  await page.goto("/adgangsstyring/brugere");
  await page.getByRole("searchbox", { name: "Søg" }).fill("ui-person@example.test");
  const user = page.getByRole("row", { name: /UI-testperson/ });
  await user.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("ansættelser");
  await dialog.getByRole("button", { name: "Annuller" }).click();

  await page.goto("/adgangsstyring/ansaettelser");
  await page.getByRole("searchbox", { name: "Søg" }).fill("UI-testperson");
  employment = page.getByRole("row", { name: /UI-testperson/ });
  await employment.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(employment).toHaveCount(0);

  await page.goto("/adgangsstyring/brugere");
  await page.getByRole("searchbox", { name: "Søg" }).fill("ui-person@example.test");
  await page.getByRole("row", { name: /UI-testperson/ }).getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(page.getByRole("row", { name: /UI-testperson/ })).toHaveCount(0);
});

test("personaleoversigten filtrerer på periode, navn og afsnit", async ({ page }) => {
  await page.goto("/personale");
  const select = page.getByLabel("Vælg planlægningsperiode");
  await select.selectOption("40000000-0000-0000-0000-000000000001");
  const search = page.getByRole("searchbox", { name: "Søg" });
  await search.fill("Anna Jensen");
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toHaveCount(0);
  await search.fill("Peter Hansen");
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toBeVisible();
  await search.fill("");
  await page.getByRole("combobox", { name: "Afsnit" }).selectOption("Medicinsk afsnit");
  await search.fill("Peter Hansen");
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toHaveCount(0);
});

test("den indbyggede datovælger bruger dark theme uden at flytte formularens indhold", async ({ page }) => {
  await page.goto("/perioder");
  await page.getByRole("button", { name: "+ Opret periode" }).click();
  const dialog = page.getByRole("dialog");
  const start = dialog.getByLabel("Startdato");
  const end = dialog.getByLabel("Slutdato");
  await expect(start).toHaveAttribute("type", "date");
  await expect(end).toHaveAttribute("type", "date");
  await expect(start).toHaveCSS("color-scheme", "dark");
  await expect(end).toHaveCSS("color-scheme", "dark");

  const initialHeight = await dialog.evaluate(element => element.getBoundingClientRect().height);
  await start.click();
  const activeHeight = await dialog.evaluate(element => element.getBoundingClientRect().height);
  expect(activeHeight).toBe(initialHeight);

  await dialog.getByLabel("Navn").fill("Kalender-testperiode");
  await start.fill("2030-01-15");
  await end.fill("2030-01-31");
  await dialog.getByRole("button", { name: "Gem periode" }).click();
  const row = page.getByRole("row", { name: /Kalender-testperiode/ });
  await expect(row).toContainText("15.01.2030");
  await expect(row).toContainText("31.01.2030");

  await row.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(row).toHaveCount(0);
});

test("succesbeskeder får nedtælling, kan lukkes og forsvinder automatisk", async ({ page }) => {
  await page.goto("/adgangsstyring/brugere");
  await page.getByRole("button", { name: "+ Opret bruger" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Fulde navn").fill("Toast-testperson");
  await dialog.getByLabel("E-mail").fill("toast-person@example.test");
  await dialog.getByRole("button", { name: "Gem bruger" }).click();

  let status = page.getByRole("status").filter({ hasText: "Oprettet." });
  await expect(status).toBeVisible();
  await expect(status.getByText("10s")).toBeVisible();
  await status.getByRole("button", { name: "Luk besked" }).click();
  await expect(status).toHaveCount(0);

  await page.getByRole("button", { name: "+ Opret bruger" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Oprettet." })).toHaveCount(0);
  await dialog.getByLabel("Fulde navn").fill("Toast-testperson nummer to");
  await dialog.getByLabel("E-mail").fill("toast-person-two@example.test");
  await dialog.getByRole("button", { name: "Gem bruger" }).click();
  status = page.getByRole("status").filter({ hasText: "Oprettet." });
  await expect(status).toBeVisible();
  await expect(status).toHaveCount(0, { timeout: 13_000 });

  // Search by unique e-mail: the larger fixture includes many pages of users.
  for (const email of ["toast-person-two@example.test", "toast-person@example.test"]) {
    await page.getByRole("searchbox", { name: "Søg" }).fill(email);
    const row = page.getByRole("row", { name: new RegExp(email.replace(".", "\\.")) });
    await row.getByRole("button", { name: "Slet" }).click();
    await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  }
});

test("ansættelser findes kun under Adgangsstyring og personale viser afsnitsfarver", async ({ page }) => {
  await page.goto("/personale");
  const nav = page.getByRole("navigation", { name: "Hovednavigation" });
  await expect(nav.getByRole("link", { name: "Ansættelser" })).toHaveCount(0);
  await page.getByLabel("Vælg planlægningsperiode").selectOption("40000000-0000-0000-0000-000000000001");
  await page.getByRole("combobox", { name: "Afsnit" }).selectOption("Akutafsnit");
  const acuteRow = page.getByRole("row", { name: /Akutafsnit/ }).first();
  await expect(acuteRow.locator(".color-dot")).toBeVisible();
  await expect(acuteRow.locator(".color-dot")).toHaveCSS("background-color", "rgb(37, 99, 235)");
  await page.getByRole("link", { name: "Adgangsstyring" }).click();
  await expect(page.getByRole("link", { name: "Ansættelser" })).toBeVisible();
});

test("ansættelsestabellen opdaterer navnene, selv når opslagsdata hentes senere", async ({ page }) => {
  // Reproduce the actual race observed in CI: employment rows arrive before lookup data.
  for (const endpoint of ["users", "sections", "staffgroups"]) {
    await page.route(`**/api/${endpoint}`, async route => {
      await new Promise(resolve => setTimeout(resolve, 900));
      await route.continue();
    });
  }
  await page.goto("/adgangsstyring/ansaettelser");
  const search = page.getByRole("searchbox", { name: "Søg" });
  await search.fill("Anna Jensen");
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toBeVisible();
  await search.fill("Peter Hansen");
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toBeVisible();
  await search.fill("Ukendt bruger");
  await expect(page.getByRole("row", { name: /Ukendt bruger/ })).toHaveCount(0);
  await page.getByRole("link", { name: "Ansættelser" }).click();
  await expect(page.getByRole("navigation", { name: "Hovednavigation" })
    .getByRole("link", { name: "Adgangsstyring" })).toHaveClass(/active/);
});

test("personale viser afsnitsfarver fra sections når API svarer uden sectionColorHex", async ({ page }) => {
  // Reproduce an older local API build, whose personnel DTO does not contain the color.
  await page.route("**/api/personnel?*", async route => {
    const response = await route.fetch();
    const rows: Record<string, unknown>[] = await response.json();
    await route.fulfill({
      response,
      json: rows.map(row => {
        const copy = { ...row };
        delete copy.sectionColorHex;
        return copy;
      }),
    });
  });

  await page.goto("/personale");
  await page.getByLabel("Vælg planlægningsperiode").selectOption("40000000-0000-0000-0000-000000000001");
  const section = page.getByRole("combobox", { name: "Afsnit" });
  await section.selectOption("Akutafsnit");
  const acute = page.getByRole("row", { name: /Akutafsnit/ }).first().locator(".color-dot");
  await expect(acute).toHaveCSS("background-color", "rgb(37, 99, 235)");
  await section.selectOption("Medicinsk afsnit");
  const medical = page.getByRole("row", { name: /Medicinsk afsnit/ }).first().locator(".color-dot");
  await expect(medical).toHaveCSS("background-color", "rgb(5, 150, 105)");
});

test("ansættelsesformularens indbyggede datofelter har mørkt tema", async ({ page }) => {
  await page.goto("/adgangsstyring/ansaettelser");
  await page.getByRole("button", { name: "+ Opret ansættelse" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Startdato")).toHaveAttribute("type", "date");
  await expect(dialog.getByLabel("Slutdato")).toHaveAttribute("type", "date");
  await expect(dialog.getByLabel("Startdato")).toHaveCSS("color-scheme", "dark");
  await expect(dialog.getByLabel("Slutdato")).toHaveCSS("color-scheme", "dark");
  await dialog.getByRole("button", { name: "Annuller" }).click();
});
