import { readFileSync } from 'fs';
import { join } from 'path';

export interface ConfirmationEmailData {
  language: 'pl' | 'en';
  confirmUrl: string;
}

export function loadConfirmationEmailTemplate(): string {
  const templatePath = join(__dirname, 'confirmation-email.html');
  return readFileSync(templatePath, 'utf-8');
}

export function buildConfirmationEmailContent(data: ConfirmationEmailData): { subject: string; html: string } {
  const { language, confirmUrl } = data;
  const isPolish = language === 'pl';
  
  // Completely rebuild subject to avoid any hidden characters
  const polishSubject = 'Potwierdź subskrypcję newslettera BWitek.dev';
  const englishSubject = 'Confirm your BWitek.dev newsletter subscription';
  
  const content = {
    subject: isPolish ? polishSubject : englishSubject,
    title: isPolish ? 'Potwierdź subskrypcję newslettera' : 'Confirm your newsletter subscription',
    greeting: isPolish ? 'Cześć!' : 'Hello!',
    intro: isPolish 
      ? 'Dzięki za zainteresowanie moim newsletterem BWitek.dev. Aby zakończyć proces subskrypcji, potwierdź swój adres email klikając poniższy link:'
      : 'Thank you for your interest in my newsletter BWitek.dev. To complete the subscription process, please confirm your email address by clicking the link below:',
    buttonText: isPolish ? 'Potwierdź subskrypcję' : 'Confirm subscription',
    footerText: isPolish 
      ? 'Jeśli nie rejestrowałeś się do mojego newslettera, po prostu zignoruj tę wiadomość.'
      : 'If you did not sign up for my newsletter, simply ignore this email.',
    signature: isPolish ? 'Bogusław Witek' : 'Bogusław Witek',
    previewText: isPolish ? polishSubject : englishSubject,
    tagline: isPolish ? 'Blog o technologii i programowaniu' : 'Technology and programming blog',
  };

  const template = loadConfirmationEmailTemplate();
  
  const html = template
    .replace(/{{SUBJECT}}/g, content.subject)
    .replace(/{{PREVIEW_TEXT}}/g, content.previewText)
    .replace(/{{TERMINAL_ICON_URL}}/g, `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/apple-icon.png`)
    .replace(/{{TAGLINE}}/g, content.tagline)
    .replace(/{{TITLE}}/g, content.title)
    .replace(/{{GREETING}}/g, content.greeting)
    .replace(/{{INTRO}}/g, content.intro)
    .replace(/{{CONFIRM_URL}}/g, confirmUrl)
    .replace(/{{BUTTON_TEXT}}/g, content.buttonText)
    .replace(/{{FOOTER_TEXT}}/g, content.footerText)
    .replace(/{{SIGNATURE}}/g, content.signature);

  return {
    subject: content.subject,
    html,
  };
} 