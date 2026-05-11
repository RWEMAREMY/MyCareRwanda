import crypto from 'crypto'

const CLOUDINARY_CLOUD_NAME = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim()
const CLOUDINARY_UPLOAD_PRESET = String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim()
const CLOUDINARY_API_KEY = String(process.env.CLOUDINARY_API_KEY || '').trim()
const CLOUDINARY_API_SECRET = String(process.env.CLOUDINARY_API_SECRET || '').trim()
const CLOUDINARY_FOLDER = String(process.env.CLOUDINARY_FOLDER || 'mycare/profile-images').trim()

const hasUnsignedConfig = () => Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)
const hasSignedConfig = () => Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)

export const isCloudinaryConfigured = () => hasUnsignedConfig() || hasSignedConfig()

export const uploadProfileImageToCloudinary = async (dataUrl: string) => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET (unsigned), or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET (signed).',
    )
  }

  const formData = new URLSearchParams()
  formData.set('file', dataUrl)
  formData.set('folder', CLOUDINARY_FOLDER)

  if (hasUnsignedConfig()) {
    formData.set('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  } else {
    const timestamp = Math.floor(Date.now() / 1000)
    const stringToSign = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

    formData.set('api_key', CLOUDINARY_API_KEY)
    formData.set('timestamp', String(timestamp))
    formData.set('signature', signature)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    },
  )

  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } }
  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed.')
  }

  return payload.secure_url
}
