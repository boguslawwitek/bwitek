export interface EmailTemplate<T = any> {
  getSubject: (data: T) => string;
  getHtmlContent: (data: T) => string;
  getTextContent: (data: T) => string;
}

export { contactFormTemplate } from './contact-form';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export enum EmailType {
  CONTACT_FORM = 'contact_form',
} 