'use server'
import fs from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'

export async function saveGoogleKeys(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const clientSecret = formData.get('clientSecret') as string

  if (!clientId || !clientSecret) return

  const envPath = path.join(process.cwd(), '.env')
  let envContent = ''
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  // Update or append GOOGLE_CLIENT_ID
  if (envContent.includes('GOOGLE_CLIENT_ID=')) {
    envContent = envContent.replace(/GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID="${clientId}"`)
  } else {
    envContent += `\nGOOGLE_CLIENT_ID="${clientId}"`
  }

  // Update or append GOOGLE_CLIENT_SECRET
  if (envContent.includes('GOOGLE_CLIENT_SECRET=')) {
    envContent = envContent.replace(/GOOGLE_CLIENT_SECRET=.*/g, `GOOGLE_CLIENT_SECRET="${clientSecret}"`)
  } else {
    envContent += `\nGOOGLE_CLIENT_SECRET="${clientSecret}"`
  }

  fs.writeFileSync(envPath, envContent)

  revalidatePath('/configuracoes')
}
