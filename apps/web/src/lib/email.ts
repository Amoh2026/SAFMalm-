import { Resend } from 'resend';

const FROM = 'Svensk Algeriska Föreningen <noreply@safmalmo.se>';
const ADMIN_EMAIL = 'safmalmoe@gmail.com';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(key);
}

// ─────────────────────────────────────────────────────────
// 1. Confirmation email — sent on form submit
// ─────────────────────────────────────────────────────────
export async function sendConfirmationEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.safmalmo.se';
  const verifyUrl = `${siteUrl}/api/verify-application?token=${params.token}`;

  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: 'Bekräfta din medlemsansökan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e3a8a; margin-bottom: 20px;">Hej ${params.name},</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Tack för din ansökan om medlemskap i Svensk Algeriska Föreningen i Malmö.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          För att bekräfta att din e-postadress är korrekt, klicka på länken nedan:
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}"
             style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Bekräfta min e-post
          </a>
        </p>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Länken är giltig i 48 timmar. Om du inte har skickat in en ansökan kan du ignorera detta e-postmeddelande.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          Svensk Algeriska Föreningen i Malmö<br />
          Scheelegatan 7, 212 28 Malmö<br />
          safmalmoe@gmail.com
        </p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// 2. Admin notification — sent on email confirmation
// ─────────────────────────────────────────────────────────
export async function sendAdminNotification(params: {
  applicantName: string;
  applicantEmail: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.safmalmo.se';
  const adminUrl = `${siteUrl}/sv/login`;

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Ny medlemsansökan från ${params.applicantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e3a8a;">Ny medlemsansökan</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          En ny ansökan har inkommit från <strong>${params.applicantName}</strong> (${params.applicantEmail}).
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Logga in på adminpanelen för att granska ansökan.
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${adminUrl}"
             style="background-color: #1e3a8a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Logga in på adminpanelen
          </a>
        </p>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          Gå sedan till <strong>Admin → Ansökningar</strong> i menyn.
        </p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// 3. Approval email — sent when admin approves application
// ─────────────────────────────────────────────────────────
export async function sendApprovalEmail(params: {
  to: string;
  name: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.safmalmo.se';
  const registerUrl = `${siteUrl}/sv/register?email=${encodeURIComponent(params.to)}`;

  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: 'Din medlemsansökan har godkänts',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a; margin-bottom: 20px;">Grattis ${params.name}!</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Din ansökan om medlemskap i Svensk Algeriska Föreningen i Malmö har godkänts.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Skapa ditt konto genom att klicka på knappen nedan. Använd samma e-postadress som du ansökte med.
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${registerUrl}"
             style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Skapa mitt konto
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          Svensk Algeriska Föreningen i Malmö<br />
          Scheelegatan 7, 212 28 Malmö<br />
          safmalmoe@gmail.com
        </p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// 4. Rejection email
// ─────────────────────────────────────────────────────────
export async function sendRejectionEmail(params: {
  to: string;
  name: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: params.to,
    subject: 'Angående din medlemsansökan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e3a8a; margin-bottom: 20px;">Hej ${params.name},</h1>
        <p style="font-size: 16px; line-height: 1.6;">
          Tack för din ansökan om medlemskap i Svensk Algeriska Föreningen i Malmö.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Tyvärr kan vi i dagsläget inte godkänna din ansökan.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Om du har frågor är du välkommen att kontakta oss på safmalmoe@gmail.com.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">
          Svensk Algeriska Föreningen i Malmö<br />
          Scheelegatan 7, 212 28 Malmö
        </p>
      </div>
    `,
  });
}