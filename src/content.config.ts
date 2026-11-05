import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.enum([
      'Bridal',
      'Engagement & Sagai',
      'Festival',
      'Guest & Group',
      'Home Service',
    ]),
    order: z.number().int().min(1).max(5),
    badges: z
      .array(z.enum(['Natural', 'Instant', 'Alta']))
      .min(1),
    inclusions: z.array(z.string()).min(1).max(2),
    priceLabel: z
      .string()
      .regex(/^(₹[\d,]+(\s*(per hand onwards|onwards|per hand))?|On request|Included within Kota|₹\d+–₹\d+ per hand)$/),
    negotiationNote: z.string().min(20).max(140).optional(),
    waContext: z.enum(['bridal', 'engagement', 'festival', 'group', 'homeservice']),
    featured: z.boolean().default(false),
  })
    .refine(
      (s) =>
        s.name !== 'Bridal' ||
        (s.badges.length === 1 && s.badges[0] === 'Natural'),
      { message: 'BR-10: Bridal must be Natural only' }
    )
    .refine(
      (s) =>
        s.priceLabel === 'On request' ||
        (s.negotiationNote?.length ?? 0) >= 20,
      { message: 'BR-30: numeric price requires negotiationNote (≥20 chars)' }
    ),
});

const gallery = defineCollection({
  type: 'content',
  schema: z.object({
    alt: z.string().min(10),
    caption: z.string(),
    category: z.enum(['Bridal', 'Festival', 'Arabic', 'Figures', 'Designer', 'Guest', 'Alta']),
    hennaType: z.enum(['Natural', 'Instant', 'Alta']),
    featured: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().min(50).max(160),
    ogImage: z.string().optional(),
  }),
});

export const collections = {
  services,
  gallery,
  pages,
};
