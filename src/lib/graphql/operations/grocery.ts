/** GraphQL operations for the grocery storefront */

export const GROCERY_PRODUCT_FIELDS = `
  fragment GroceryProductFields on Product {
    id
    name
    slug
    description
    thumbnail { url alt }
    allergens
    dietaryTags
    calories
    spiceLevel
    isAlcohol
    countryOfOrigin
    sellByWeight
    pricePerUnit
    unitOfMeasure
    storageZone
    ingredients
    nutritionFacts {
      calories
      fat
      saturatedFat
      carbs
      sugar
      fiber
      protein
      salt
      servingSize
    }
    certifications
    freshness
    nearestExpiry
    category { id name slug }
    pricing {
      priceRange {
        start { gross { amount currency } }
      }
      priceRangeUndiscounted {
        start { gross { amount currency } }
      }
      onSale
    }
    variants {
      id
      name
      sku
      pricing { price { gross { amount currency } } }
      quantityAvailable
      expiryTracking
      shelfLifeDays
      preOrder { enabled date depositPercent maxQuantity }
    }
  }
`;

export const PRODUCTS_QUERY = `
  ${GROCERY_PRODUCT_FIELDS}
  query GroceryProducts(
    $channel: String!
    $first: Int
    $after: String
    $filter: ProductFilterInput
    $sortBy: ProductOrder
  ) {
    products(
      channel: $channel
      first: $first
      after: $after
      filter: $filter
      sortBy: $sortBy
    ) {
      edges {
        node { ...GroceryProductFields }
        cursor
      }
      pageInfo { hasNextPage endCursor }
      totalCount
    }
  }
`;

export const PRODUCT_BY_SLUG_QUERY = `
  ${GROCERY_PRODUCT_FIELDS}
  query GroceryProduct($channel: String!, $slug: String!) {
    product(channel: $channel, slug: $slug) {
      ...GroceryProductFields
      media { url alt type }
    }
  }
`;

export const PRODUCTS_BY_ZONE_QUERY = `
  ${GROCERY_PRODUCT_FIELDS}
  query ProductsByZone($channel: String!, $zone: StorageZone!, $first: Int) {
    productsByStorageZone(channel: $channel, zone: $zone, first: $first) {
      edges {
        node { ...GroceryProductFields }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export const RECIPE_FIELDS = `
  fragment RecipeFields on Recipe {
    id
    name
    slug
    description
    thumbnail { url alt }
    servings
    prepTime
    cookTime
    totalTime
    difficulty
  }
`;

export const RECIPES_QUERY = `
  ${RECIPE_FIELDS}
  query Recipes($channel: String!, $first: Int, $after: String) {
    recipes(channel: $channel, first: $first, after: $after) {
      edges {
        node { ...RecipeFields }
        cursor
      }
      pageInfo { hasNextPage endCursor }
      totalCount
    }
  }
`;

export const RECIPE_BY_SLUG_QUERY = `
  ${RECIPE_FIELDS}
  query RecipeBySlug($channel: String!, $slug: String!) {
    recipe(channel: $channel, slug: $slug) {
      ...RecipeFields
      steps {
        stepNumber
        instruction
        image { url alt }
      }
      ingredients {
        id
        quantity
        unit
        displayName
        isOptional
        inStock
        variant {
          id
          name
          pricing { price { gross { amount currency } } }
        }
        product {
          id
          name
          thumbnail { url alt }
        }
      }
    }
  }
`;

export const PRODUCT_RECIPES_QUERY = `
  ${RECIPE_FIELDS}
  query ProductRecipes($channel: String!, $productId: ID!, $first: Int) {
    productRecipes(channel: $channel, productId: $productId, first: $first) {
      edges {
        node { ...RecipeFields }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

// --- Checkout mutations ---

export const CHECKOUT_CREATE_MUTATION = `
  mutation CheckoutCreateFull($input: CheckoutCreateInput!) {
    checkoutCreateFull(input: $input) {
      checkout {
        id
        token
        email
        totalPrice { gross { amount currency } }
        availableShippingMethods {
          id name
          price { amount currency }
          minimumDeliveryDays maximumDeliveryDays
        }
        availablePaymentMethods {
          id name description provider methodType iconUrl
          fee { amount currency }
        }
      }
      errors { field message code }
    }
  }
`;

export const CHECKOUT_SHIPPING_ADDRESS_UPDATE = `
  mutation CheckoutShippingAddressUpdate($input: CheckoutShippingAddressUpdateInput!) {
    checkoutShippingAddressUpdate(input: $input) {
      checkout {
        id
        shippingPrice { amount currency }
        totalPrice { gross { amount currency } }
        availableShippingMethods {
          id name
          price { amount currency }
          minimumDeliveryDays maximumDeliveryDays
        }
      }
      errors { field message code }
    }
  }
`;

export const CHECKOUT_SHIPPING_METHOD_UPDATE = `
  mutation CheckoutShippingMethodUpdate($input: CheckoutShippingMethodUpdateInput!) {
    checkoutShippingMethodUpdate(input: $input) {
      checkout {
        id
        shippingPrice { amount currency }
        totalPrice { gross { amount currency } }
        shippingMethod { id name price { amount currency } }
      }
      errors { field message code }
    }
  }
`;

export const CHECKOUT_PAYMENT_CREATE = `
  mutation CheckoutPaymentCreate($checkoutId: ID!, $input: PaymentInput!) {
    checkoutPaymentCreate(checkoutId: $checkoutId, input: $input) {
      payment { id gateway status clientSecret actionUrl }
      errors { field message }
    }
  }
`;

export const CHECKOUT_COMPLETE_MUTATION = `
  mutation CheckoutComplete($input: CheckoutCompleteInput!) {
    checkoutComplete(input: $input) {
      order { id number status total { gross { amount currency } } createdAt }
      confirmationNeeded
      errors { field message code }
    }
  }
`;

export const CHECKOUT_NOTE_UPDATE = `
  mutation CheckoutNoteUpdate($input: CheckoutNoteUpdateInput!) {
    checkoutNoteUpdate(input: $input) {
      checkout { id }
      errors { field message }
    }
  }
`;

export const CHECKOUT_PROMO_CODE_ADD = `
  mutation CheckoutPromoCodeAdd($checkoutId: ID!, $promoCode: String!) {
    checkoutPromoCodeAdd(checkoutId: $checkoutId, promoCode: $promoCode) {
      checkout {
        id
        discount { amount currency }
        totalPrice { gross { amount currency } }
      }
      errors { field message code }
    }
  }
`;

export const CHECKOUT_PROMO_CODE_REMOVE = `
  mutation CheckoutPromoCodeRemove($checkoutId: ID!) {
    checkoutPromoCodeRemove(checkoutId: $checkoutId) {
      checkout {
        id
        totalPrice { gross { amount currency } }
      }
      errors { field message }
    }
  }
`;

export const AVAILABLE_SHIPPING_METHODS_QUERY = `
  query AvailableShippingMethods($channel: String!) {
    availableShippingMethods(channel: $channel) {
      id name description
      price { amount currency }
      minimumDeliveryDays maximumDeliveryDays
    }
  }
`;

export const AVAILABLE_PAYMENT_METHODS_QUERY = `
  query AvailablePaymentMethods($channel: String!) {
    availablePaymentMethods(channel: $channel) {
      id name description provider methodType iconUrl
      fee { amount currency }
    }
  }
`;
