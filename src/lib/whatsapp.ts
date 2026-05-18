/** Support WhatsApp number (international format, no spaces or +). */
export const SUPPORT_WA_NUMBER = '447411202861';

/** Plain wa.me link (no prefilled message) — for generic "contact support" CTAs. */
export const SUPPORT_WA_URL = `https://wa.me/${SUPPORT_WA_NUMBER}`;

/** Pre-filled message sent automatically when the user taps a "Free 12h Test" CTA. */
export const FREE_TEST_MESSAGE =
  "Hi! I'd like to try the 12h FREE TEST of MediaHubAccess. Please send me the access details 🙏";

/** wa.me URL with the FREE TEST message pre-populated in the chat input. */
export const FREE_TEST_WA_URL = `${SUPPORT_WA_URL}?text=${encodeURIComponent(FREE_TEST_MESSAGE)}`;
