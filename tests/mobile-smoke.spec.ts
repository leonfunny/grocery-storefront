import { expect, test } from '@playwright/test';
import { mockMobileStorefront, seedCartStorage } from './mobile-fixtures';

test.describe('mobile storefront smoke', () => {
  test('uses the header as the only products search surface and avoids duplicate field ids', async ({ page }) => {
    await mockMobileStorefront(page);
    const widths = [320, 375, 390, 430, 768];

    for (const width of widths) {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 780 });
      await page.goto('/en/products?search=apples');
      await expect(page.getByTestId('product-card').first()).toBeVisible();
      await expect(page.locator('#product-search')).toHaveCount(0);
      await expect(page.getByTestId('products-page-search')).toHaveCount(0);

      const duplicateIds = await page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll<HTMLElement>('[id]'))
          .map((element) => element.id)
          .filter(Boolean);

        return ids.filter((id, index) => ids.indexOf(id) !== index);
      });

      expect(duplicateIds).toEqual([]);

      if (width < 768) {
        await page.getByRole('button', { name: /open search/i }).click();
        const visibleSearch = page.locator('input[type="search"]:visible');
        await expect(visibleSearch).toHaveCount(1);
        await expect(visibleSearch).toHaveValue('apples');
      } else {
        const desktopSearch = page.locator('#desktop-search');
        await expect(desktopSearch).toBeVisible();
        await expect(desktopSearch).toHaveValue('apples');
        await expect(page.locator('input[type="search"]:visible')).toHaveCount(1);
      }
    }
  });

  test('keeps the mobile header focused on primary actions and moves secondary controls into the menu', async ({ page }) => {
    await mockMobileStorefront(page);
    await page.goto('/en/products');

    await expect(page.getByRole('button', { name: /open search/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^cart/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    await expect(page.getByTestId('mobile-header-theme')).toBeHidden();
    await expect(page.getByTestId('mobile-header-language')).toBeHidden();

    await page.getByRole('button', { name: /open menu/i }).click();

    await expect(page.getByTestId('mobile-nav-theme')).toBeVisible();
    await expect(page.getByTestId('mobile-nav-language')).toBeVisible();
  });

  test('opens mobile filters in a drawer and stacks product actions vertically', async ({ page }) => {
    await mockMobileStorefront(page);
    await page.goto('/en/products');

    await page.getByRole('button', { name: /filters/i }).click();
    const filterSheet = page.getByTestId('mobile-filter-sheet');
    await expect(filterSheet).toBeVisible();
    await expect(filterSheet.getByRole('button', { name: /close filters/i }).nth(1)).toBeVisible();

    const card = page.getByTestId('product-card').first();
    const quantity = card.getByTestId('product-card-quantity');
    const cta = card.getByTestId('product-card-add');
    const quantityBox = await quantity.boundingBox();
    const ctaBox = await cta.boundingBox();

    expect(quantityBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();
    expect(ctaBox!.y).toBeGreaterThan(quantityBox!.y + quantityBox!.height - 1);

    await filterSheet.getByRole('button', { name: /close filters/i }).first().click({ force: true });
    await expect(filterSheet).toBeHidden();
    await cta.click();
    await expect(page.getByTestId('mobile-cart-count')).toHaveText('1');
  });

  test('shows an explicit error state when the products query fails', async ({ page }) => {
    await mockMobileStorefront(page, { products: 'error' });
    await page.goto('/en/products');

    await expect(page.getByText(/channel 'default' not found or inactive/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    await expect(page.getByText(/no products match your filters/i)).toHaveCount(0);
  });

  test('keeps checkout visible on the cart page with wrapped item controls', async ({ page }) => {
    await seedCartStorage(page);
    await mockMobileStorefront(page, { cart: 'single-item' });
    await page.goto('/en/cart');

    const cartItem = page.getByTestId('cart-item').first();
    const mobileSummaryBar = page.getByTestId('mobile-cart-summary-bar');
    await expect(page.getByRole('heading', { name: /your cart/i })).toBeVisible();
    await expect(cartItem).toBeVisible();
    await expect(mobileSummaryBar).toBeVisible();
    await expect(mobileSummaryBar.getByRole('link', { name: /proceed to checkout/i })).toBeVisible();
    const saveForLater = page.getByRole('button', { name: /save for later/i }).first();
    const decreaseQuantity = page.getByRole('button', { name: /decrease organic gala apples family value pack quantity/i }).first();
    await expect(saveForLater).toBeVisible();
    await expect(decreaseQuantity).toBeVisible();
    const infoY = await saveForLater.evaluate((element) => element.getBoundingClientRect().top);
    const controlsY = await decreaseQuantity.evaluate((element) => element.getBoundingClientRect().top);

    expect(controlsY).toBeGreaterThan(infoY + 1);
  });

  test('keeps mobile checkout progress and order context visible through review', async ({ page }) => {
    await seedCartStorage(page);
    await mockMobileStorefront(page, { cart: 'single-item' });
    await page.goto('/en/checkout');

    await expect(page.getByTestId('mobile-checkout-progress')).toBeVisible();
    await expect(page.getByTestId('mobile-checkout-summary-bar')).toBeVisible();

    await page.getByLabel(/first name/i).fill('Marta');
    await page.getByLabel(/last name/i).fill('Nowak');
    await page.getByLabel(/^email/i).fill('marta@example.com');
    await page.getByLabel(/address/i).fill('Marszalkowska 1');
    await page.getByLabel(/city/i).fill('Warsaw');
    await page.getByLabel(/postal code/i).fill('00-001');
    await page.getByLabel(/country/i).fill('PL');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /standard courier/i }).click();
    await page.getByRole('button', { name: /credit\/debit card/i }).click();

    await expect(page.getByTestId('mobile-checkout-progress-current')).toContainText(/review/i);
    await expect(page.getByTestId('mobile-checkout-summary-panel')).toContainText(/organic gala apples/i);
  });
});
