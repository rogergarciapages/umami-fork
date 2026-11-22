import { z } from 'zod';

export const shareConfigInputSchema = z
  .object({
    brandName: z.string().trim().max(100).optional(),
    logoUrl: z.string().trim().max(1000000).optional(),
    headerDisplay: z.enum(['both', 'logo', 'tagline', 'title']).optional(),
    primaryColor: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .optional()
      .or(z.literal('')),
    backgroundColor: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .optional()
      .or(z.literal('')),
    cardBackgroundColor: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .optional()
      .or(z.literal('')),
    textColor: z
      .string()
      .trim()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .optional()
      .or(z.literal('')),
    defaultTheme: z.enum(['system', 'light', 'dark']).optional(),
    hideUmamiBranding: z.boolean().optional(),
  })
  .meta({ id: 'ShareConfigInput' });
