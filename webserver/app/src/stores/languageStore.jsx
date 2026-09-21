import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { i18n } from '@lingui/core';

// Dynamically fetch and activate the compiled translation catalog
export async function dynamicActivate(locale) {
  try {
    const { messages } = await import(`../locales/${locale}/messages.js`);
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (err) {
  }
}

export const useLanguageStore = create(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: async (newLocale) => {
        await dynamicActivate(newLocale);
        set({ locale: newLocale });
      },
    }),
    {
      name: 'tgc-language',
    }
  )
);