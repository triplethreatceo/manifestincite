import { z } from 'zod';

export const clientFormSchema = z.object({
  company_legal_name: z.string().min(1, 'Company name is required'),
  dba_name: z.string().default(''),
  dot_number: z.string().default(''),
  mc_number: z.string().default(''),
  ein: z.string().default(''),
  business_address: z.string().default(''),
  mailing_address: z.string().default(''),
  contact_person: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().email('Invalid email').or(z.literal('')).default(''),
  start_date: z.string().default(''),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  monthly_service_fee: z.string().default(''),
  white_label_partner: z.string().default(''),
  internal_notes: z.string().default(''),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;