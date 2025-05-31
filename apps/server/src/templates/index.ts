export interface EmailTemplate<T = any> {
  getSubject: (data: T) => string;
  getHtmlContent: (data: T) => string;
  getTextContent: (data: T) => string;
}

export { contactFormTemplate } from './contact-form';
export { newCommentTemplate } from './new-comment';
export { buildConfirmationEmailContent, type ConfirmationEmailData } from './confirmation-email';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface NewCommentData {
  postTitle: string;
  postUrl: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  createdAt: string;
  adminUrl: string;
}

export enum EmailType {
  CONTACT_FORM = 'contact_form',
  NEW_COMMENT = 'new_comment',
} 