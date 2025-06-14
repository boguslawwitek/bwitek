import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import fs from 'fs';
import path from 'path';

async function loadMessagesFromDirectory(locale: string) {
  let messages: Record<string, any> = {};
  
  try {
    const messagesDirectory = path.join(process.cwd(), 'messages', locale);
    
    if (fs.existsSync(messagesDirectory)) {
      const files = fs.readdirSync(messagesDirectory)
        .filter(file => file.endsWith('.json'));
      
      for (const file of files) {
        const moduleName = file.replace('.json', '');
        const moduleMessages = (await import(`../../messages/${locale}/${file}`)).default;
        messages[moduleName] = moduleMessages;
      }
    } else {
      messages = (await import(`../../messages/${locale}.json`)).default;
    }
  } catch (error) {
    console.error(`Failed to load messages for ${locale}`, error);
    messages = (await import(`../../messages/${locale}.json`)).default;
  }
  
  return messages;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  
  return {
    locale,
    messages: await loadMessagesFromDirectory(locale)
  };
});