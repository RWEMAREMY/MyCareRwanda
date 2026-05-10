import nodemailer from 'nodemailer'

const smtpHost = String(process.env.SMTP_HOST || '').trim()
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = String(process.env.SMTP_USER || '').trim()
const smtpPass = String(process.env.SMTP_PASS || '').trim()
const smtpFrom = String(process.env.SMTP_FROM || smtpUser || 'no-reply@mycarerwanda.local').trim()
const hasSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass)

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null

export const sendPasswordResetOtpEmail = async (email: string, otp: string) => {
  const subject = 'MyCare Rwanda password reset OTP'
  const text = [
    'You requested a password reset for your MyCare Rwanda account.',
    `OTP: ${otp}`,
    'This code expires in 10 minutes.',
    'If you did not request this reset, you can ignore this email.',
  ].join('\n')

  if (!transporter) {
    console.warn(
      `[mailer] SMTP not configured. OTP for ${email}: ${otp}. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM.`,
    )
    return
  }

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject,
    text,
  })
}
