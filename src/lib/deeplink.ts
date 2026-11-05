import { site } from '../config/site';

export type MessageContext =
  | 'bridal'
  | 'engagement'
  | 'festival'
  | 'group'
  | 'homeservice'
  | 'general';

const TEMPLATES: Record<MessageContext, string> = {
  general:
    'Hello Shagun, looking for more details about your bridal and event mehendi services in Kota. Please share details.',
  bridal:
    'Hello Shagun, mujhe bridal mehendi chahiye — Date: ___, Location: ___, Hands + Feet. Please share pricing and availability.',
  engagement:
    'Hello Shagun, mujhe engagement/sagai ke liye mehendi chahiye — Date: ___, Location: ___. Please share pricing.',
  festival:
    'Hello Shagun, mujhe festival ke liye mehendi chahiye — Date: ___, Location: ___, approx ___ hands. Please share rate.',
  group:
    'Hello Shagun, mujhe sangeet/function ke liye group mehendi chahiye — Date: ___, Venue: ___, approx ___ guests. Please share group rates.',
  homeservice:
    'Hello Shagun, mujhe ghar par mehendi chahiye — Date: ___, Location: ___, ___ hands. Please share availability.',
};

export function buildWhatsAppLink(context: MessageContext = 'general'): string {
  const text = TEMPLATES[context];
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function getPhoneLink(): string {
  return `tel:${site.phoneE164}`;
}

export function getEmailLink(): string {
  return `mailto:${site.email}`;
}
