import type { NewCommentData } from './index';
import { escapeHtml, isSafeUrl } from '../lib/sanitize';

export const newCommentTemplate = {
  getSubject: (data: NewCommentData) =>
    `Nowy komentarz do zatwierdzenia - ${escapeHtml(data.postTitle)}`,

  getHtmlContent: (data: NewCommentData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
        Nowy komentarz do zatwierdzenia
      </h2>

      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Artykul:</h3>
        <p><strong>${escapeHtml(data.postTitle)}</strong></p>
        <p><a href="${escapeHtml(data.postUrl)}" style="color: #dc2626; text-decoration: none;">Zobacz artykul</a></p>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Autor komentarza:</h3>
        <p><strong>Imie:</strong> ${escapeHtml(data.authorName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.authorEmail)}">${escapeHtml(data.authorEmail)}</a></p>
        ${data.authorWebsite && isSafeUrl(data.authorWebsite) ? `<p><strong>Strona:</strong> <a href="${escapeHtml(data.authorWebsite)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.authorWebsite)}</a></p>` : ''}
        <p><strong>Data:</strong> ${escapeHtml(data.createdAt)}</p>
      </div>

      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Tresc komentarza:</h3>
        <div style="line-height: 1.6; color: #4b5563; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
          ${escapeHtml(data.content).replace(/\n/g, '<br>')}
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(data.adminUrl)}"
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Przejdz do panelu administracyjnego
        </a>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
          <strong>Uwaga:</strong> Ten komentarz wymaga Twojego zatwierdzenia przed publikacja na stronie BWitek.dev
        </p>
      </div>
    </div>
  `,

  getTextContent: (data: NewCommentData) => `
Nowy komentarz do zatwierdzenia

Artykul: ${data.postTitle}
URL: ${data.postUrl}

Autor komentarza:
Imie: ${data.authorName}
Email: ${data.authorEmail}
${data.authorWebsite ? `Strona: ${data.authorWebsite}` : ''}
Data: ${data.createdAt}

Tresc komentarza:
${data.content}

Panel administracyjny: ${data.adminUrl}

---
Ten komentarz wymaga Twojego zatwierdzenia przed publikacja na stronie BWitek.dev
  `.trim(),
};
