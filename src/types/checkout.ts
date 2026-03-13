import { z } from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'required'),
  lastName: z.string().min(1, 'required'),
  email: z.string().min(1, 'required').email('invalidEmail'),
  phone: z.string().optional(),
  streetAddress1: z.string().min(1, 'required'),
  city: z.string().min(1, 'required'),
  postalCode: z.string().min(1, 'required'),
  shippingMethodId: z.string().min(1, 'required'),
  paymentMethodId: z.string().min(1, 'required'),
  note: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export type CheckoutStep = 'delivery' | 'shipping' | 'payment' | 'review';

export interface ShippingMethod {
  id: string;
  name: string;
  price: { amount: number; currency: string };
  minimumDeliveryDays?: number;
  maximumDeliveryDays?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  methodType?: string;
  iconUrl?: string;
  fee?: { amount: number; currency: string };
}
