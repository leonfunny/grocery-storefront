import type { Page, Route } from '@playwright/test';

type Money = {
  amount: number;
  currency: string;
};

type CartLineState = {
  id: string;
  merchandiseId: string;
  quantity: number;
  cost: {
    totalAmount: Money;
    amountPerQuantity: Money;
  };
};

type CartState = {
  id: string;
  lines: CartLineState[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
    totalDutyAmount: Money;
  };
  buyerIdentity: {
    email: string;
    phone: string;
    countryCode: string;
  };
  note: string;
  attributes: Array<{ key: string; value: string }>;
  discountCodes: Array<{ code: string; applicable: boolean }>;
  createdAt: string;
  updatedAt: string;
};

type CheckoutState = {
  id: string;
  email: string;
  availableShippingMethods: Array<{
    id: string;
    name: string;
    price: Money;
  }>;
  shippingPrice: Money;
  totalPrice: {
    gross: Money;
  };
  note: string;
};

const PRIMARY_PRODUCT = {
  id: 'prod-apples',
  name: 'Organic Gala Apples Family Value Pack',
  slug: 'organic-gala-apples',
  description: 'Sweet and crisp apples ready for everyday delivery.',
  thumbnail: null,
  allergens: ['nuts', 'milk', 'soybeans'],
  dietaryTags: ['vegan'],
  calories: 52,
  spiceLevel: null,
  isAlcohol: false,
  countryOfOrigin: 'Poland',
  sellByWeight: false,
  pricePerUnit: 2.99,
  unitOfMeasure: 'kg',
  storageZone: 'AMBIENT',
  ingredients: 'Apples',
  nutritionFacts: {
    calories: 52,
    fat: 0.2,
    saturatedFat: 0,
    carbs: 14,
    sugar: 10,
    fiber: 2.4,
    protein: 0.3,
    salt: 0,
    servingSize: '100g',
  },
  certifications: ['Organic'],
  freshness: 'FRESH',
  nearestExpiry: '2026-03-25',
  category: {
    id: 'cat-fruit',
    name: 'Fruit',
    slug: 'fruit',
  },
  pricing: {
    priceRange: {
      start: {
        gross: {
          amount: 12.99,
          currency: 'PLN',
        },
      },
    },
    priceRangeUndiscounted: {
      start: {
        gross: {
          amount: 15.99,
          currency: 'PLN',
        },
      },
    },
    onSale: true,
  },
  variants: [
    {
      id: 'variant-apples',
      name: '1 kg',
      sku: 'APPLE-1KG',
      pricing: {
        price: {
          gross: {
            amount: 12.99,
            currency: 'PLN',
          },
        },
      },
      quantityAvailable: 20,
      expiryTracking: true,
      shelfLifeDays: 7,
      preOrder: null,
    },
  ],
};

const SECONDARY_PRODUCT = {
  ...PRIMARY_PRODUCT,
  id: 'prod-berries',
  name: 'Blueberries Snack Box',
  slug: 'blueberries-snack-box',
  allergens: [],
  dietaryTags: ['vegan', 'gluten-free'],
  storageZone: 'CHILLED',
  pricing: {
    priceRange: {
      start: {
        gross: {
          amount: 8.49,
          currency: 'PLN',
        },
      },
    },
    priceRangeUndiscounted: {
      start: {
        gross: {
          amount: 8.49,
          currency: 'PLN',
        },
      },
    },
    onSale: false,
  },
  variants: [
    {
      id: 'variant-berries',
      name: '250 g',
      sku: 'BERRY-250',
      pricing: {
        price: {
          gross: {
            amount: 8.49,
            currency: 'PLN',
          },
        },
      },
      quantityAvailable: 12,
      expiryTracking: true,
      shelfLifeDays: 5,
      preOrder: null,
    },
  ],
};

const PRODUCTS = [PRIMARY_PRODUCT, SECONDARY_PRODUCT];

const RECIPES = [
  {
    id: 'recipe-salad',
    name: 'Spring Fruit Salad',
    slug: 'spring-fruit-salad',
    description: 'Fast mobile-friendly recipe content for homepage coverage.',
    thumbnail: null,
    servings: 2,
    prepTime: 10,
    cookTime: 0,
    totalTime: 10,
    difficulty: 'EASY',
  },
];

const DELIVERY_OPTIONS = [
  {
    id: 'delivery-standard',
    name: 'Standard courier',
    price: {
      amount: 9.99,
      currency: 'PLN',
    },
  },
  {
    id: 'delivery-pickup',
    name: 'Pickup in store',
    price: {
      amount: 0,
      currency: 'PLN',
    },
  },
];

const PAYMENT_METHODS = [
  {
    code: 'card',
    name: 'Card',
  },
  {
    code: 'blik',
    name: 'BLIK',
  },
];

function buildProductEdge(product: (typeof PRODUCTS)[number], index: number) {
  return {
    cursor: `cursor-${index + 1}`,
    node: product,
  };
}

function buildCart(lines: CartLineState[]): CartState {
  const subtotal = lines.reduce((sum, line) => sum + line.cost.totalAmount.amount, 0);

  return {
    id: 'cart-1',
    lines,
    cost: {
      subtotalAmount: { amount: subtotal, currency: 'PLN' },
      totalAmount: { amount: subtotal, currency: 'PLN' },
      totalTaxAmount: { amount: 0, currency: 'PLN' },
      totalDutyAmount: { amount: 0, currency: 'PLN' },
    },
    buyerIdentity: {
      email: 'mobile@example.com',
      phone: '+48123123123',
      countryCode: 'PL',
    },
    note: '',
    attributes: [],
    discountCodes: [],
    createdAt: '2026-03-18T08:00:00.000Z',
    updatedAt: '2026-03-18T08:00:00.000Z',
  };
}

function buildCartLine(quantity = 1): CartLineState {
  return {
    id: 'line-1',
    merchandiseId: 'variant-apples',
    quantity,
    cost: {
      amountPerQuantity: { amount: 12.99, currency: 'PLN' },
      totalAmount: { amount: 12.99 * quantity, currency: 'PLN' },
    },
  };
}

function buildCheckoutState(): CheckoutState {
  return {
    id: 'checkout-1',
    email: 'mobile@example.com',
    availableShippingMethods: DELIVERY_OPTIONS,
    shippingPrice: DELIVERY_OPTIONS[0].price,
    totalPrice: {
      gross: {
        amount: 22.98,
        currency: 'PLN',
      },
    },
    note: '',
  };
}

async function fulfill(route: Route, data: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  });
}

export async function seedCartStorage(page: Page, cartId = 'cart-1') {
  await page.addInitScript((seedId) => {
    window.localStorage.setItem(
      'grocery-cart',
      JSON.stringify({
        state: { cartId: seedId },
        version: 1,
      })
    );
  }, cartId);
}

interface MockMobileStorefrontOptions {
  cart?: 'empty' | 'single-item';
  products?: 'ok' | 'error';
  onProductsQuery?: (variables: Record<string, unknown>) => void;
}

export async function mockMobileStorefront(
  page: Page,
  options: MockMobileStorefrontOptions = {}
) {
  let cart = buildCart(options.cart === 'single-item' ? [buildCartLine()] : []);
  let checkout = buildCheckoutState();

  await page.route('**/api/graphql', async (route) => {
    const rawBody = route.request().postData() ?? '{}';
    const body = JSON.parse(rawBody) as { query?: string; variables?: Record<string, any> };
    const query = body.query ?? '';

    if (query.includes('query GroceryProducts')) {
      options.onProductsQuery?.(body.variables ?? {});

      if (options.products === 'error') {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [
              {
                message: "Channel 'default' not found or inactive",
              },
            ],
            data: {
              products: null,
            },
          }),
        });
        return;
      }

      await fulfill(route, {
        products: {
          edges: PRODUCTS.map(buildProductEdge),
          pageInfo: { hasNextPage: false, endCursor: null },
          totalCount: PRODUCTS.length,
        },
      });
      return;
    }

    if (query.includes('query SearchProductsIndex')) {
      await fulfill(route, {
        products: {
          edges: PRODUCTS.map((product) => ({
            node: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              category: product.category,
              pricing: {
                priceRange: product.pricing.priceRange,
              },
            },
          })),
        },
      });
      return;
    }

    if (query.includes('query Recipes')) {
      await fulfill(route, {
        recipes: {
          edges: RECIPES.map((recipe, index) => ({
            cursor: `recipe-${index + 1}`,
            node: recipe,
          })),
          pageInfo: { hasNextPage: false, endCursor: null },
          totalCount: RECIPES.length,
        },
      });
      return;
    }

    if (query.includes('query CartProductMetadata')) {
      await fulfill(route, {
        products: {
          edges: PRODUCTS.map((product) => ({
            node: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              storageZone: product.storageZone,
              allergens: product.allergens,
              pricing: {
                priceRange: product.pricing.priceRange,
              },
              variants: product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                pricing: variant.pricing,
              })),
            },
          })),
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      });
      return;
    }

    if (query.includes('query GetCart')) {
      await fulfill(route, { cart });
      return;
    }

    if (query.includes('mutation CartCreate')) {
      const quantity = body.variables?.input?.lines?.[0]?.quantity ?? 1;
      cart = buildCart([buildCartLine(quantity)]);
      await fulfill(route, {
        cartCreate: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CartLinesAdd')) {
      const currentQuantity = cart.lines[0]?.quantity ?? 0;
      const addedQuantity = body.variables?.lines?.[0]?.quantity ?? 1;
      cart = buildCart([buildCartLine(currentQuantity + addedQuantity)]);
      await fulfill(route, {
        cartLinesAdd: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CartLinesUpdate')) {
      const quantity = body.variables?.lines?.[0]?.quantity ?? 1;
      cart = buildCart(quantity > 0 ? [buildCartLine(quantity)] : []);
      await fulfill(route, {
        cartLinesUpdate: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CartLinesRemove')) {
      cart = buildCart([]);
      await fulfill(route, {
        cartLinesRemove: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CartBuyerIdentityUpdate')) {
      cart = {
        ...cart,
        buyerIdentity: {
          email: body.variables?.buyerIdentity?.email ?? 'mobile@example.com',
          phone: body.variables?.buyerIdentity?.phone ?? '+48123123123',
          countryCode: body.variables?.buyerIdentity?.countryCode ?? 'PL',
        },
      };
      await fulfill(route, {
        cartBuyerIdentityUpdate: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CartNoteUpdate')) {
      cart = {
        ...cart,
        note: body.variables?.note ?? '',
      };
      await fulfill(route, {
        cartNoteUpdate: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('query CartDeliveryOptions')) {
      await fulfill(route, {
        cartDeliveryOptions: DELIVERY_OPTIONS,
      });
      return;
    }

    if (query.includes('mutation CartSelectedDeliveryOptionsUpdate')) {
      await fulfill(route, {
        cartSelectedDeliveryOptionsUpdate: {
          cart,
          userErrors: [],
        },
      });
      return;
    }

    if (query.includes('query AvailablePaymentMethods')) {
      await fulfill(route, {
        availablePaymentMethods: PAYMENT_METHODS,
      });
      return;
    }

    if (query.includes('mutation CheckoutCreateFull')) {
      await fulfill(route, {
        checkoutCreateFull: {
          checkout: {
            id: checkout.id,
            email: checkout.email,
            lines: cart.lines.map((line) => ({
              id: line.id,
              quantity: line.quantity,
              variant: {
                id: line.merchandiseId,
                name: PRIMARY_PRODUCT.variants[0].name,
                sku: PRIMARY_PRODUCT.variants[0].sku,
              },
              totalPrice: {
                gross: line.cost.totalAmount,
              },
            })),
            subtotalPrice: {
              gross: cart.cost.subtotalAmount,
            },
            totalPrice: checkout.totalPrice,
          },
          errors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CheckoutShippingAddressUpdate')) {
      await fulfill(route, {
        checkoutShippingAddressUpdate: {
          checkout: {
            id: checkout.id,
            availableShippingMethods: checkout.availableShippingMethods,
          },
          errors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CheckoutShippingMethodUpdate')) {
      const shippingPrice = DELIVERY_OPTIONS[0].price;
      checkout = {
        ...checkout,
        shippingPrice,
        totalPrice: {
          gross: {
            amount: cart.cost.subtotalAmount.amount + shippingPrice.amount,
            currency: shippingPrice.currency,
          },
        },
      };
      await fulfill(route, {
        checkoutShippingMethodUpdate: {
          checkout: {
            id: checkout.id,
            shippingPrice,
            totalPrice: checkout.totalPrice,
          },
          errors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CheckoutPaymentCreate')) {
      await fulfill(route, {
        checkoutPaymentCreate: {
          payment: {
            id: 'payment-1',
            gateway: 'card',
            status: 'AUTHORIZED',
            clientSecret: null,
            actionUrl: null,
            total: checkout.totalPrice.gross,
          },
          errors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CheckoutNoteUpdate')) {
      checkout = {
        ...checkout,
        note: body.variables?.input?.note ?? '',
      };
      await fulfill(route, {
        checkoutNoteUpdate: {
          checkout: {
            id: checkout.id,
            note: checkout.note,
          },
          errors: [],
        },
      });
      return;
    }

    if (query.includes('mutation CheckoutComplete')) {
      await fulfill(route, {
        checkoutComplete: {
          order: {
            id: 'order-1',
            number: '1001',
            status: 'UNFULFILLED',
            createdAt: '2026-03-18T09:00:00.000Z',
            total: checkout.totalPrice,
          },
          confirmationNeeded: false,
          errors: [],
        },
      });
      return;
    }

    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        errors: [{ message: `Unhandled mock query: ${query.slice(0, 60)}` }],
      }),
    });
  });
}
