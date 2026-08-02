export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

type Dictionary = Record<string, string>;

const en: Dictionary = {
  "nav.home": "Home",
  "nav.circles": "Circles",
  "nav.proposals": "Proposals",
  "nav.activities": "Activities",
  "nav.perks": "Perks",
  "nav.memorabilia": "Memorabilia",
  "nav.calendar": "Calendar",
  "nav.inbox": "Inbox",
  "nav.settings": "Settings",
  "home.greeting": "Things to do near you",
  "home.nearby": "Near you",
  "home.vote": "Vote on next month",
  "proposals.title": "Activity proposals",
  "proposals.subtitle": "Vote for what you want to happen near you next month.",
  "proposals.vote": "Vote for this",
  "proposals.voted": "You voted",
  "proposals.threshold": "votes to go",
  "circles.title": "Circles",
  "circles.subtitle": "Small local groups built around a shared interest.",
  "circles.join": "Join circle",
  "circles.leave": "Leave circle",
  "perks.title": "Senior perks",
  "perks.subtitle": "Local offers for members, no membership fee.",
  "perks.claim": "Claim perk",
  "perks.claimed": "Claimed",
  "common.loading": "Loading…",
  "common.retry": "Try again",
  "common.save": "Save changes",
};

// Partial translations degrade to English, with a notice surfaced in settings.
const overrides: Partial<Record<LanguageCode, Dictionary>> = {
  hi: {
    "nav.home": "होम",
    "nav.circles": "मंडली",
    "nav.proposals": "प्रस्ताव",
    "nav.activities": "गतिविधियाँ",
    "nav.perks": "लाभ",
    "nav.calendar": "कैलेंडर",
    "nav.inbox": "संदेश",
    "nav.settings": "सेटिंग्स",
    "home.greeting": "आपके पास करने के लिए चीज़ें",
    "proposals.vote": "इसे वोट दें",
    "proposals.voted": "आपने वोट दिया",
    "circles.join": "मंडली में शामिल हों",
    "perks.claim": "लाभ लें",
    "common.loading": "लोड हो रहा है…",
  },
  te: {
    "nav.home": "హోమ్",
    "nav.circles": "బృందాలు",
    "nav.proposals": "ప్రతిపాదనలు",
    "nav.perks": "ప్రయోజనాలు",
    "home.greeting": "మీ దగ్గర చేయదగిన పనులు",
    "proposals.vote": "దీనికి ఓటు వేయండి",
    "circles.join": "బృందంలో చేరండి",
  },
  ta: {
    "nav.home": "முகப்பு",
    "nav.circles": "வட்டங்கள்",
    "nav.proposals": "பரிந்துரைகள்",
    "nav.perks": "சலுகைகள்",
    "home.greeting": "உங்கள் அருகில் செய்யக்கூடியவை",
    "proposals.vote": "வாக்களிக்கவும்",
  },
  bn: {
    "nav.home": "হোম",
    "nav.circles": "সার্কেল",
    "nav.proposals": "প্রস্তাব",
    "nav.perks": "সুবিধা",
    "home.greeting": "আপনার কাছাকাছি করার মতো কিছু",
  },
  mr: {
    "nav.home": "मुख्यपृष्ठ",
    "nav.circles": "मंडळे",
    "nav.proposals": "प्रस्ताव",
    "home.greeting": "तुमच्या जवळ करण्यासारख्या गोष्टी",
  },
  kn: {
    "nav.home": "ಮುಖಪುಟ",
    "nav.circles": "ವಲಯಗಳು",
    "nav.proposals": "ಪ್ರಸ್ತಾವನೆಗಳು",
    "home.greeting": "ನಿಮ್ಮ ಹತ್ತಿರ ಮಾಡಬಹುದಾದವು",
  },
  ur: {
    "nav.home": "ہوم",
    "nav.circles": "حلقے",
    "nav.proposals": "تجاویز",
    "home.greeting": "آپ کے قریب کرنے کے کام",
  },
};

export const RTL_LANGUAGES: LanguageCode[] = ["ur"];

export const translate = (language: LanguageCode, key: string): string =>
  overrides[language]?.[key] ?? en[key] ?? key;

export const coverageFor = (language: LanguageCode): number => {
  if (language === "en") return 100;
  const total = Object.keys(en).length;
  const covered = Object.keys(overrides[language] ?? {}).length;
  return Math.round((covered / total) * 100);
};
