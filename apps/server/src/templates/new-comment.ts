import type { NewCommentData } from './index';

export const newCommentTemplate = {
  getSubject: (data: NewCommentData) => 
    `Nowy komentarz do zatwierdzenia - ${data.postTitle}`,

  getHtmlContent: (data: NewCommentData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
        Nowy komentarz do zatwierdzenia
      </h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Artykuł:</h3>
        <p><strong>${data.postTitle}</strong></p>
        <p><a href="${data.postUrl}" style="color: #dc2626; text-decoration: none;">Zobacz artykuł</a></p>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Autor komentarza:</h3>
        <p><strong>Imię:</strong> ${data.authorName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.authorEmail}">${data.authorEmail}</a></p>
        ${data.authorWebsite ? `<p><strong>Strona:</strong> <a href="${data.authorWebsite}" target="_blank">${data.authorWebsite}</a></p>` : ''}
        <p><strong>Data:</strong> ${data.createdAt}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Treść komentarza:</h3>
        <div style="line-height: 1.6; color: #4b5563; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
          ${data.content.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.adminUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Przejdź do panelu administracyjnego
        </a>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
          <strong>Uwaga:</strong> Ten komentarz wymaga Twojego zatwierdzenia przed publikacją na stronie BWitek.dev
        </p>
      </div>
    </div>
  `,

  getTextContent: (data: NewCommentData) => `
Nowy komentarz do zatwierdzenia

Artykuł: ${data.postTitle}
URL: ${data.postUrl}

Autor komentarza:
Imię: ${data.authorName}
Email: ${data.authorEmail}
${data.authorWebsite ? `Strona: ${data.authorWebsite}` : ''}
Data: ${data.createdAt}

Treść komentarza:
${data.content}

Panel administracyjny: ${data.adminUrl}

---
Ten komentarz wymaga Twojego zatwierdzenia przed publikacją na stronie BWitek.dev
  `.trim(),
}; 