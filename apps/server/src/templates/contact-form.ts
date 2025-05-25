import type { ContactFormData } from './index';

export const contactFormTemplate = {
  getSubject: (data: ContactFormData) => 
    `Nowa wiadomość z formularza kontaktowego - ${data.name}`,

  getHtmlContent: (data: ContactFormData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
        Nowa wiadomość z formularza kontaktowego
      </h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Dane nadawcy:</h3>
        <p><strong>Imię i nazwisko:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #374151; margin-top: 0;">Wiadomość:</h3>
        <p style="line-height: 1.6; color: #4b5563;">${data.message.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
          <strong>Uwaga:</strong> To jest automatyczna wiadomość z formularza kontaktowego na stronie BWitek.dev
        </p>
      </div>
    </div>
  `,

  getTextContent: (data: ContactFormData) => `
Nowa wiadomość z formularza kontaktowego

Dane nadawcy:
Imię i nazwisko: ${data.name}
Email: ${data.email}

Wiadomość:
${data.message}

---
To jest automatyczna wiadomość z formularza kontaktowego na stronie BWitek.dev
  `.trim(),
}; 