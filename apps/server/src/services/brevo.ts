import { readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { db } from '../db';
import { pendingNewsletterSubscriptions, unsubscribeFeedback } from '../db/schema/newsletter';
import { eq, lt } from 'drizzle-orm';
import { buildConfirmationEmailContent } from '../templates';

interface SubscriberData {
  email: string;
  language: 'pl' | 'en';
  source?: string;
}

interface NewsletterData {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt?: string;
  articleOgImage?: string;
  language: 'pl' | 'en';
}

export interface SubscriberStats {
  polish: { count: number };
  english: { count: number };
  total: { count: number };
}

export interface SendNewsletterResult {
  success: boolean;
  recipientCount: number;
  campaignId?: string;
}

export class BrevoService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private polishListId: string;
  private englishListId: string;
  private contactsLimit: number;
  private apiUrl = 'https://api.brevo.com/v3';

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || '';
    this.senderName = process.env.BREVO_SENDER_NAME || 'BWitek.dev';
    this.polishListId = process.env.BREVO_PL_LIST_ID || '';
    this.englishListId = process.env.BREVO_EN_LIST_ID || '';
    this.contactsLimit = parseInt(process.env.BREVO_CONTACTS_LIMIT || '100');

    if (!this.apiKey) {
      throw new Error('BREVO_API_KEY is required');
    }
    if (!this.senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL is required');
    }
    if (!this.polishListId || !this.englishListId) {
      throw new Error('BREVO_PL_LIST_ID and BREVO_EN_LIST_ID are required');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'api-key': this.apiKey,
      'Accept': 'application/json',
    };

    if (options.body && typeof options.body === 'string') {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Brevo API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Brevo API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async sendTransactionalEmail(data: {
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    textContent?: string;
    tags?: string[];
  }) {
    const emailData = {
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      to: data.to,
      subject: data.subject,
      htmlContent: data.htmlContent,
      textContent: data.textContent || data.htmlContent.replace(/<[^>]*>/g, ''),
      tags: data.tags || [],
    };

    return this.makeRequest('/smtp/email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async subscribe(data: SubscriberData): Promise<{ success: boolean; subscriberId?: string }> {
    const listId = data.language === 'pl' ? this.polishListId : this.englishListId;
    const otherListId = data.language === 'pl' ? this.englishListId : this.polishListId;

    try {
      const contactData = {
        email: data.email,
        attributes: {
          LANGUAGE: data.language.toUpperCase(),
          SOURCE: data.source || 'website',
          SUBSCRIBED_AT: new Date().toISOString(),
        },
        listIds: [parseInt(listId)],
        updateEnabled: true,
      };

      // Remove from other list to avoid duplicates
      try {
        await this.makeRequest(`/contacts/lists/${otherListId}/contacts/remove`, {
          method: 'POST',
          body: JSON.stringify({ emails: [data.email] }),
        });
      } catch (error) {
        // Ignore error if contact wasn't in other list
      }

      await this.makeRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });

      return {
        success: true,
        subscriberId: data.email,
      };
    } catch (error) {
      console.error('Brevo subscription error:', error);
      throw error;
    }
  }

  async unsubscribe(email: string): Promise<{ success: boolean }> {
    try {
      const promises = [
        this.makeRequest(`/contacts/lists/${this.polishListId}/contacts/remove`, {
          method: 'POST',
          body: JSON.stringify({ emails: [email] }),
        }).catch(() => {}),
        this.makeRequest(`/contacts/lists/${this.englishListId}/contacts/remove`, {
          method: 'POST',
          body: JSON.stringify({ emails: [email] }),
        }).catch(() => {}),
      ];

      await Promise.allSettled(promises);
      return { success: true };
    } catch (error) {
      console.error('Brevo unsubscribe error:', error);
      throw error;
    }
  }

  async requestSubscription(data: SubscriberData): Promise<{ success: boolean; token: string }> {
    await this.cleanupExpiredPendingSubscriptions();

    const existing = await db.select().from(pendingNewsletterSubscriptions)
      .where(eq(pendingNewsletterSubscriptions.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(pendingNewsletterSubscriptions)
        .where(eq(pendingNewsletterSubscriptions.email, data.email));
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.insert(pendingNewsletterSubscriptions).values({
      id: crypto.randomUUID(),
      email: data.email,
      language: data.language,
      source: data.source || 'website',
      token,
      expiresAt,
      createdAt: new Date(),
    });

    await this.sendConfirmationEmail(data.email, data.language, token);

    return {
      success: true,
      token,
    };
  }

  async confirmSubscription(token: string): Promise<{ success: boolean; email: string; language: 'pl' | 'en' }> {
    const pending = await db.select().from(pendingNewsletterSubscriptions)
      .where(eq(pendingNewsletterSubscriptions.token, token))
      .limit(1);

    if (pending.length === 0) {
      throw new Error('Invalid confirmation token');
    }

    const subscription = pending[0];

    if (subscription.expiresAt < new Date()) {
      await db.delete(pendingNewsletterSubscriptions)
        .where(eq(pendingNewsletterSubscriptions.token, token));
      throw new Error('Confirmation token has expired');
    }

    await this.subscribe({
      email: subscription.email,
      language: subscription.language,
      source: 'confirmed',
    });

    await db.delete(pendingNewsletterSubscriptions)
      .where(eq(pendingNewsletterSubscriptions.token, token));

    return {
      success: true,
      email: subscription.email,
      language: subscription.language,
    };
  }

  async saveUnsubscribeFeedback(data: {
    email: string;
    reason: 'too_frequent' | 'not_relevant' | 'never_subscribed' | 'poor_content' | 'technical_issues' | 'other';
    feedback?: string;
    language: 'pl' | 'en';
  }): Promise<{ success: boolean }> {
    await db.insert(unsubscribeFeedback).values({
      id: crypto.randomUUID(),
      email: data.email,
      reason: data.reason,
      feedback: data.feedback || null,
      language: data.language,
      createdAt: new Date(),
    });

    return { success: true };
  }

  private async cleanupExpiredPendingSubscriptions(): Promise<void> {
    await db.delete(pendingNewsletterSubscriptions)
      .where(lt(pendingNewsletterSubscriptions.expiresAt, new Date()));
  }

  private async sendConfirmationEmail(email: string, language: 'pl' | 'en', token: string): Promise<void> {
    const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/${language}/newsletter/confirm?token=${token}`;
    
    const emailContent = buildConfirmationEmailContent({
      language,
      confirmUrl,
    });
    
    try {
      await this.sendTransactionalEmail({
        to: [{ email }],
        subject: emailContent.subject,
        htmlContent: emailContent.html,
        tags: ['confirmation', `language:${language}`, 'newsletter_signup'],
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  async getSubscriberStats(): Promise<SubscriberStats> {
    try {
      const [polishResponse, englishResponse] = await Promise.all([
        this.makeRequest(`/contacts/lists/${this.polishListId}/contacts?limit=1&offset=0`),
        this.makeRequest(`/contacts/lists/${this.englishListId}/contacts?limit=1&offset=0`),
      ]);

      const polishCount = polishResponse.count || 0;
      const englishCount = englishResponse.count || 0;

      return {
        polish: { count: polishCount },
        english: { count: englishCount },
        total: { count: polishCount + englishCount },
      };
    } catch (error) {
      console.error('Brevo stats error:', error);
      
      return {
        polish: { count: 0 },
        english: { count: 0 },
        total: { count: 0 },
      };
    }
  }

  async sendNewsletter(data: NewsletterData): Promise<SendNewsletterResult> {
    const listId = data.language === 'pl' ? this.polishListId : this.englishListId;
    const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/${data.language}/blog/${data.articleSlug}`;
    
    try {
      const campaignContent = this.buildNewsletterContent(data, articleUrl);
      
      // Get all contacts from the list using pagination
      const allContacts = await this.getAllContactsFromList(listId);

      if (allContacts.length === 0) {
        return {
          success: false,
          recipientCount: 0,
        };
      }

      console.log(`Found ${allContacts.length} total contacts in list`);

      // If 100 or fewer contacts, send normally
      if (allContacts.length <= 100) {
        return await this.sendToSingleBatch(data, campaignContent, listId, allContacts);
      }

      // For more than 100 contacts, send in batches of 100 with 2-minute delays
      return await this.sendInBatches(data, campaignContent, listId, allContacts);

    } catch (error) {
      console.error('Newsletter sending error:', error);
      throw error;
    }
  }

  private async getAllContactsFromList(listId: string): Promise<any[]> {
    const allContacts: any[] = [];
    let offset = 0;
    const limit = 500; // Brevo API limit per request
    let hasMore = true;

    while (hasMore) {
      const response = await this.makeRequest(`/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`);
      const contacts = response.contacts || [];
      
      allContacts.push(...contacts);
      
      hasMore = contacts.length === limit;
      offset += limit;
    }

    return allContacts;
  }

  private async sendToSingleBatch(
    data: NewsletterData, 
    campaignContent: any, 
    listId: string, 
    contacts: any[]
  ): Promise<SendNewsletterResult> {
    const campaignData = {
      name: `Newsletter: ${data.articleTitle} (${data.language})`,
      subject: campaignContent.subject,
      sender: {
        name: this.senderName,
        email: this.senderEmail,
      },
      type: 'classic',
      htmlContent: campaignContent.html,
      textContent: campaignContent.text,
      recipients: {
        listIds: [parseInt(listId)],
      },
      // Disable automatic Brevo footer and use our custom one
      header: `[DEFAULT_INCLUDE_FOOTER_ONLY]`,
      unsubscribeLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/${data.language}/newsletter/unsubscribe`,
    };

    let campaign;
    let usedTransactionalFallback = false;
    
    try {
      campaign = await this.makeRequest('/emailCampaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      });

      if (!campaign.id) {
        throw new Error('Campaign was created but no ID was returned');
      }

      await this.makeRequest(`/emailCampaigns/${campaign.id}/sendNow`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      
    } catch (campaignError) {
      console.warn('Campaign creation/sending failed, using transactional email fallback:', campaignError);
      
      usedTransactionalFallback = true;
      await this.sendTransactionalEmailBatch(contacts, campaignContent, data);
    }

    return {
      success: true,
      recipientCount: contacts.length,
      campaignId: usedTransactionalFallback ? 'transactional-fallback' : campaign?.id?.toString(),
    };
  }

  private async sendInBatches(
    data: NewsletterData, 
    campaignContent: any, 
    listId: string, 
    allContacts: any[]
  ): Promise<SendNewsletterResult> {
    const batchSize = 100;
    const batches = [];
    
    // Split contacts into batches of 100
    for (let i = 0; i < allContacts.length; i += batchSize) {
      batches.push(allContacts.slice(i, i + batchSize));
    }

    console.log(`Sending newsletter to ${allContacts.length} contacts in ${batches.length} batches of ${batchSize}`);

    let totalSent = 0;
    const campaignIds: string[] = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const isLastBatch = batchIndex === batches.length - 1;

      console.log(`Sending batch ${batchIndex + 1}/${batches.length} (${batch.length} contacts)...`);

      try {
        // Create temporary contact list for this batch
        const tempListName = `temp_newsletter_${data.language}_batch_${batchIndex + 1}_${Date.now()}`;
        const tempList = await this.createTemporaryList(tempListName);

        // Add batch contacts to temporary list
        await this.addContactsToList(tempList.id, batch);

        // Create and send campaign to temporary list
        const campaignData = {
          name: `Newsletter Batch ${batchIndex + 1}: ${data.articleTitle} (${data.language})`,
          subject: campaignContent.subject,
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          type: 'classic',
          htmlContent: campaignContent.html,
          textContent: campaignContent.text,
          recipients: {
            listIds: [tempList.id],
          },
          // Disable automatic Brevo footer and use our custom one
          header: `[DEFAULT_INCLUDE_FOOTER_ONLY]`,
          unsubscribeLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/${data.language}/newsletter/unsubscribe`,
        };

        try {
          const campaign = await this.makeRequest('/emailCampaigns', {
            method: 'POST',
            body: JSON.stringify(campaignData),
          });

          if (campaign.id) {
            await this.makeRequest(`/emailCampaigns/${campaign.id}/sendNow`, {
              method: 'POST',
              body: JSON.stringify({}),
            });
            campaignIds.push(campaign.id.toString());
          }
        } catch (campaignError) {
          console.warn(`Campaign failed for batch ${batchIndex + 1}, using transactional fallback:`, campaignError);
          await this.sendTransactionalEmailBatch(batch, campaignContent, data);
          campaignIds.push('transactional-fallback');
        }

        // Clean up temporary list
        await this.deleteTemporaryList(tempList.id);

        totalSent += batch.length;
        console.log(`Batch ${batchIndex + 1} sent successfully`);

        // Wait 2 minutes before sending next batch (except for the last batch)
        if (!isLastBatch) {
          console.log('Waiting 2 minutes before sending next batch...');
          await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        }

      } catch (batchError) {
        console.error(`Error sending batch ${batchIndex + 1}:`, batchError);
        // Continue with next batch instead of failing completely
      }
    }

    console.log(`Newsletter sending completed. Total sent: ${totalSent}/${allContacts.length}`);

    return {
      success: true,
      recipientCount: totalSent,
      campaignId: campaignIds.join(','),
    };
  }

  private async sendTransactionalEmailBatch(contacts: any[], campaignContent: any, data: NewsletterData): Promise<void> {
    const emailRecipients = contacts.map((contact: any) => ({
      email: contact.email,
      name: contact.attributes?.FIRSTNAME || contact.email.split('@')[0],
    }));

    // Split into smaller batches for transactional emails (max 50 per request)
    const transactionalBatchSize = 50;
    const transactionalBatches = [];
    for (let i = 0; i < emailRecipients.length; i += transactionalBatchSize) {
      transactionalBatches.push(emailRecipients.slice(i, i + transactionalBatchSize));
    }
    
    for (let i = 0; i < transactionalBatches.length; i++) {
      const batch = transactionalBatches[i];
      
      await this.sendTransactionalEmail({
        to: batch,
        subject: campaignContent.subject,
        htmlContent: campaignContent.html,
        textContent: campaignContent.text,
        tags: ['newsletter', `language:${data.language}`, `article:${data.articleSlug}`],
      });
      
      if (i < transactionalBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  private async createTemporaryList(name: string): Promise<{ id: number; name: string }> {
    const listData = {
      name: name,
      folderId: 1, // Default folder
    };

    const response = await this.makeRequest('/contacts/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });

    return { id: response.id, name: response.name };
  }

  private async addContactsToList(listId: number, contacts: any[]): Promise<void> {
    const contactEmails = contacts.map(contact => contact.email);
    
    // Add contacts to list in chunks to avoid API limits
    const chunkSize = 150; // Brevo limit for adding contacts
    for (let i = 0; i < contactEmails.length; i += chunkSize) {
      const chunk = contactEmails.slice(i, i + chunkSize);
      
      await this.makeRequest(`/contacts/lists/${listId}/contacts/add`, {
        method: 'POST',
        body: JSON.stringify({ emails: chunk }),
      });
    }
  }

  private async deleteTemporaryList(listId: number): Promise<void> {
    try {
      await this.makeRequest(`/contacts/lists/${listId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn(`Could not delete temporary list ${listId}:`, error);
      // Don't throw error, just log warning
    }
  }

  private buildNewsletterContent(data: NewsletterData, articleUrl: string) {
    const isPolish = data.language === 'pl';
    
    const subject = isPolish 
      ? `Nowy artykuł: ${data.articleTitle}`
      : `New article: ${data.articleTitle}`;

    const greeting = isPolish ? 'Cześć!' : 'Hello!';
    const intro = isPolish 
      ? 'Właśnie opublikowałem nowy artykuł, który może Cię zainteresować:'
      : 'I just published a new article that might interest you:';
    const readMore = isPolish ? 'Czytaj więcej' : 'Read more';
    const footer = isPolish 
      ? 'Dziękuję za subskrypcję newslettera BWitek.dev!'
      : 'Thank you for subscribing to BWitek.dev newsletter!';
    const unsubscribe = isPolish 
      ? 'Jeśli nie chcesz już otrzymywać tych wiadomości, możesz się wypisać'
      : 'If you no longer want to receive these emails, you can unsubscribe';
    const unsubscribeLinkText = isPolish ? 'tutaj' : 'here';
    const companyAddress = isPolish 
      ? (process.env.NEWSLETTER_COMPANY_ADDRESS_PL || 'Blog o technologii i programowaniu')
      : (process.env.NEWSLETTER_COMPANY_ADDRESS_EN || 'Technology and programming blog');

    // Build unsubscribe URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const unsubscribeUrl = `${baseUrl}/${data.language}/newsletter/unsubscribe`;

    const cleanExcerpt = data.articleExcerpt 
      ? data.articleExcerpt.replace(/<[^>]*>/g, '').slice(0, 200).trim()
      : '';

    const previewText = cleanExcerpt 
      ? cleanExcerpt.slice(0, 100) + (cleanExcerpt.length > 100 ? '...' : '')
      : (isPolish ? 'Nowy artykuł na BWitek.dev o programowaniu i technologii' : 'New article on BWitek.dev about programming and technology');

    const templatesPath = join(__dirname, '../templates');
    const htmlTemplate = readFileSync(join(templatesPath, 'newsletter.html'), 'utf-8');
    const textTemplate = readFileSync(join(templatesPath, 'newsletter.txt'), 'utf-8');

    const buildFullImageUrl = (imageUrl: string): string => {
      if (!imageUrl) return '';
      if (imageUrl.startsWith('http')) return imageUrl;
      
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      
      if (imageUrl.startsWith('/api/uploads/')) {
        return `${baseUrl}${imageUrl}`;
      }
      if (imageUrl.startsWith('/uploads/')) {
        return `${baseUrl}/api${imageUrl}`;
      }
      return `${baseUrl}/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
    };

    const articleImageSection = data.articleOgImage ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <img src="${buildFullImageUrl(data.articleOgImage)}" alt="${data.articleTitle}" class="article-image" style="width: 100%; max-width: 500px; height: auto; border-radius: 0.5rem;" />
          </td>
        </tr>
      </table>
    ` : '';

    const excerptSection = cleanExcerpt ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="article-excerpt" style="font-size: 14px; line-height: 1.6; color: #374151; margin: 16px 0; background: #f9fafb; padding: 16px; border-radius: 0.5rem; border-left: 3px solid #dc2626;">
            ${cleanExcerpt}
          </td>
        </tr>
      </table>
    ` : '';

    const html = htmlTemplate
      .replace(/\{\{PREVIEW_TEXT\}\}/g, previewText)
      .replace(/\{\{SUBJECT\}\}/g, subject)
      .replace(/\{\{TERMINAL_ICON_URL\}\}/g, `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/apple-icon.png`)
      .replace(/\{\{TAGLINE\}\}/g, isPolish ? 'Blog o technologii i programowaniu' : 'Technology and programming blog')
      .replace(/\{\{GREETING\}\}/g, greeting)
      .replace(/\{\{INTRO\}\}/g, intro)
      .replace(/\{\{ARTICLE_IMAGE\}\}/g, articleImageSection)
      .replace(/\{\{ARTICLE_TITLE\}\}/g, data.articleTitle)
      .replace(/\{\{ARTICLE_EXCERPT\}\}/g, excerptSection)
      .replace(/\{\{ARTICLE_URL\}\}/g, articleUrl)
      .replace(/\{\{READ_MORE\}\}/g, readMore)
      .replace(/\{\{FOOTER\}\}/g, footer)
      .replace(/\{\{UNSUBSCRIBE\}\}/g, unsubscribe)
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)
      .replace(/\{\{UNSUBSCRIBE_LINK_TEXT\}\}/g, unsubscribeLinkText)
      .replace(/\{\{COMPANY_ADDRESS\}\}/g, companyAddress);

    const text = textTemplate
      .replace(/\{\{GREETING\}\}/g, greeting)
      .replace(/\{\{INTRO\}\}/g, intro)
      .replace(/\{\{ARTICLE_TITLE\}\}/g, data.articleTitle)
      .replace(/\{\{ARTICLE_EXCERPT\}\}/g, cleanExcerpt ? `\n${cleanExcerpt}\n` : '')
      .replace(/\{\{ARTICLE_URL\}\}/g, articleUrl)
      .replace(/\{\{READ_MORE\}\}/g, readMore)
      .replace(/\{\{FOOTER\}\}/g, footer)
      .replace(/\{\{UNSUBSCRIBE\}\}/g, unsubscribe)
      .replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl)
      .replace(/\{\{COMPANY_ADDRESS\}\}/g, companyAddress);

    return { subject, html, text };
  }

  async deleteSubscriber(email: string, listId?: string, addToBlacklist: boolean = false): Promise<{ success: boolean }> {
    try {
      const targetListId = listId || this.polishListId;
      
      await this.makeRequest(`/contacts/lists/${targetListId}/contacts/remove`, {
        method: 'POST',
        body: JSON.stringify({ emails: [email] }),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Brevo delete subscriber error:', error);
      return { success: true };
    }
  }

  async cleanupAndFixSubscriber(email: string, targetLanguage: 'pl' | 'en'): Promise<{ success: boolean }> {
    try {
      const targetListId = targetLanguage === 'pl' ? this.polishListId : this.englishListId;
      const otherListId = targetLanguage === 'pl' ? this.englishListId : this.polishListId;

      try {
        await this.deleteSubscriber(email, otherListId);
      } catch (error) {
        // Ignore error if contact wasn't in other list
      }

      const contactData = {
        email: email,
        attributes: {
          LANGUAGE: targetLanguage.toUpperCase(),
          SOURCE: 'cleanup',
          UPDATED_AT: new Date().toISOString(),
        },
        listIds: [parseInt(targetListId)],
        updateEnabled: true,
      };

      await this.makeRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData),
      });

      return { success: true };
    } catch (error) {
      console.error('Cleanup subscriber error:', error);
      throw error;
    }
  }
}

export const senderService = new BrevoService(); 