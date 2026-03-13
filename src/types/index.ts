export type StorageZone = 'AMBIENT' | 'CHILLED' | 'FROZEN';
export type Freshness = 'FRESH' | 'EXPIRING_SOON' | 'LAST_CHANCE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface NutritionFacts {
  calories?: number;
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugar?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
  servingSize?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stockQuantity: number;
  expiryTracking?: boolean;
  shelfLifeDays?: number;
  preOrder?: {
    enabled: boolean;
    date?: string;
    depositPercent?: number;
    maxQuantity?: number;
  };
}

export interface GroceryProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: ProductImage;
  images?: ProductImage[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  stockQuantity: number;

  // Food-specific fields
  allergens?: string[];
  dietaryTags?: string[];
  calories?: number;
  spiceLevel?: number;
  isAlcohol?: boolean;
  countryOfOrigin?: string;
  sellByWeight?: boolean;
  pricePerUnit?: number;
  unitOfMeasure?: string;
  storageZone?: StorageZone;
  ingredients?: string;
  nutritionFacts?: NutritionFacts;
  certifications?: string[];
  importBatchNumber?: string;

  // Freshness (computed from nearest lot expiry)
  freshness?: Freshness;
  nearestExpiry?: string;
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: ProductImage;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: Difficulty;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  image?: ProductImage;
}

export interface RecipeIngredient {
  id: string;
  quantity: number;
  unit: string;
  displayName?: string;
  isOptional: boolean;
  variant?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  product?: {
    id: string;
    name: string;
    thumbnail?: ProductImage;
  };
  inStock?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  thumbnail?: string;
  price: number;
  currency: string;
  quantity: number;
  storageZone?: StorageZone;
  allergens?: string[];
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  businessCategory?: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface ProductConnection {
  edges: { node: GroceryProduct; cursor: string }[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface RecipeConnection {
  edges: { node: Recipe; cursor: string }[];
  pageInfo: PageInfo;
  totalCount: number;
}
