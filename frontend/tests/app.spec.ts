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

  await expect(page.getByRole("row", { name: /UI-testperson/ })).toBeVisible();
  await page.goto("/adgangsstyring/ansaettelser");
  await page.getByRole("button", { name: "+ Opret ansættelse" }).click();
  await dialog.getByLabel("Bruger").selectOption({ label: "UI-testperson (ui-person@example.test)" });
  await dialog.getByLabel("Afsnit").selectOption({ label: "Akutafsnit" });
  await dialog.getByLabel("Personalegruppe").selectOption({ label: "Læger" });
  await dialog.getByLabel("Startdato").fill("2029-01-01");
  await dialog.getByLabel("Slutdato").fill("2029-06-30");
  await dialog.getByRole("button", { name: "Gem ansættelse" }).click();
  let employment = page.getByRole("row", { name: /UI-testperson/ });
  await expect(employment).toBeVisible();

  await page.goto("/adgangsstyring/brugere");
  const user = page.getByRole("row", { name: /UI-testperson/ });
  await user.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("ansættelser");
  await dialog.getByRole("button", { name: "Annuller" }).click();

  await page.goto("/adgangsstyring/ansaettelser");
  employment = page.getByRole("row", { name: /UI-testperson/ });
  await employment.getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(employment).toHaveCount(0);

  await page.goto("/adgangsstyring/brugere");
  await page.getByRole("row", { name: /UI-testperson/ }).getByRole("button", { name: "Slet" }).click();
  await dialog.getByRole("button", { name: "Slet", exact: true }).click();
  await expect(page.getByRole("row", { name: /UI-testperson/ })).toHaveCount(0);
});

test("personaleoversigten filtrerer på periode, navn og afsnit", async ({ page }) => {
  await page.goto("/personale");
  const select = page.getByLabel("Vælg planlægningsperiode");
  await expect(select).toHaveValue("40000000-0000-0000-0000-000000000001");
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toBeVisible();

  await page.getByRole("searchbox", { name: "Søg" }).fill("Anna");
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Søg" }).fill("");
  await page.getByRole("combobox", { name: "Afsnit" }).selectOption("Medicinsk afsnit");
  await expect(page.getByRole("row", { name: /Peter Hansen/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Anna Jensen/ })).toHaveCount(0);
});
