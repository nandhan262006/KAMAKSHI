const WHATSAPP_FOR = (message: string) =>
  `https://wa.me/919500138281?text=${encodeURIComponent(message)}`;

const WHATSAPP = WHATSAPP_FOR(
  "Hi Kamakshi Cinema Photography! I'd like to book you for an event.",
);

export { WHATSAPP, WHATSAPP_FOR };
