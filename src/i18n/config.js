import { getRequestConfig } from 'next-intl/server';
import { headers, cookies } from 'next/headers';

export const locales = ['en', 'ar'];
export const defaultLocale = 'ar';

const resolveLocale = async () => {
  const headersList = await headers();
  const cookieStore = await cookies();

  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const headerLocale = headersList.get('x-locale');
  const acceptLanguage = headersList.get('accept-language');

  // Prefer explicit cookie, then incoming header, then Accept-Language
  const candidate =
    cookieLocale ||
    headerLocale ||
    (acceptLanguage ? acceptLanguage.split(',')[0]?.split('-')[0] : null) ||
    defaultLocale;

  // Only allow supported locales
  if (locales.includes(candidate)) return candidate;
  return defaultLocale;
};

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  let messages = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/${defaultLocale}.json`)).default;
  }

  return { locale, messages };
});
