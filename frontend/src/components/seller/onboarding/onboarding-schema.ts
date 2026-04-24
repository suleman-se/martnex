import { z } from 'zod';

export const onboardingSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_email: z.string().email('Invalid business email address'),
  business_phone: z.string().min(10, 'Invalid phone number').optional().or(z.literal('')),
  business_address: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State/Province is required'),
    postal_code: z.string().min(4, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  tax_id: z.string().min(5, 'Tax ID must be at least 5 characters').optional().or(z.literal('')),
  payout_method: z.enum(['bank_transfer', 'paypal', 'stripe']).optional(),
  bank_details: z.object({
    account_holder: z.string().min(2, 'Account holder name is required'),
    account_number: z.string().min(8, 'Account number is required'),
    routing_number: z.string().min(5, 'Routing/Sort code is required'),
    bank_name: z.string().min(2, 'Bank name is required'),
  }).optional(),
  paypal_email: z.string().email('Invalid PayPal email').optional().or(z.literal('')),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const STEP_TITLES: Record<number, string> = {
  1: 'Business Information',
  2: 'Business Address',
  3: 'Tax & Identification',
  4: 'Payout Details',
};

export const STEP_FIELDS: Record<number, string[]> = {
  1: ['business_name', 'business_email', 'business_phone'],
  2: ['business_address.address', 'business_address.city', 'business_address.state', 'business_address.postal_code', 'business_address.country'],
  3: ['tax_id'],
  4: [],
};
