import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // locale undefined ho sakta hai (app/page.tsx root pe)
  const resolved = locale ?? 'en';

  return {
    locale: resolved,
    messages: (await import(`./messages/${resolved}.json`)).default,
  };
});