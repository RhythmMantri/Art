export function buildMeta(opts: {
  title: string;
  description: string;
  pathname: string;
  ogImage?: string;
}) {
  const base =
    (import.meta as any).env?.SITE_URL || 'https://shagun-mehendi.pages.dev';
  const canonical = new URL(opts.pathname, base).toString();
  const ogImage = opts.ogImage
    ? new URL(opts.ogImage, base).toString()
    : new URL('/og/bridal-default.jpg', base).toString();

  return {
    canonical,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogUrl: canonical,
    ogImage,
  };
}
