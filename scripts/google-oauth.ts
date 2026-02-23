/**
 * Google OAuth Helper Script
 *
 * Step 1: Run with no args to get the authorization URL
 * Step 2: Visit the URL, authorize, copy the code from redirect URL
 * Step 3: Run with the code to get the refresh token
 *
 * Usage:
 *   npx ts-node scripts/google-oauth.ts           # Get auth URL
 *   npx ts-node scripts/google-oauth.ts CODE      # Exchange code for tokens
 */

import * as dotenv from 'dotenv'
import path from 'path'

// Carrega o .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_ADS_REDIRECT_URI || 'http://localhost:3000/oauth/callback'
const SCOPES = ['https://www.googleapis.com/auth/adwords']

// Validação dos segredos
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Erro: GOOGLE_ADS_CLIENT_ID ou GOOGLE_ADS_CLIENT_SECRET não configurados no .env\n')
  process.exit(1)
}

async function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  console.log('\n=== PASSO 1: Acesse esta URL no navegador ===\n')
  console.log(url)
  console.log('\n=== PASSO 2: Autorize e copie o CODE da URL de redirecionamento ===')
  console.log('A URL será algo como: http://localhost:3000/oauth/callback?code=XXXX&scope=...')
  console.log('Copie apenas o valor do "code" (até o primeiro &)\n')
  console.log('=== PASSO 3: Execute novamente com o code ===')
  console.log('npx tsx scripts/google-oauth.ts SEU_CODE_AQUI\n')
}

async function exchangeCode(code: string) {
  console.log('\nTrocando code por tokens...\n')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    }),
  })

  const data = await response.json()

  if (data.error) {
    console.error('Erro:', data.error_description || data.error)
    process.exit(1)
  }

  console.log('=== TOKENS OBTIDOS ===\n')
  console.log('Access Token:', data.access_token?.substring(0, 50) + '...')
  console.log('\n🔑 REFRESH TOKEN (adicione ao .env):')
  console.log(`GOOGLE_ADS_REFRESH_TOKEN=${data.refresh_token}`)
  console.log('\nTambém verifique se estão no .env:')
  console.log(`GOOGLE_ADS_CLIENT_ID=${CLIENT_ID}`)
  console.log(`GOOGLE_ADS_CLIENT_SECRET=${CLIENT_SECRET}`)
  console.log('\nE o Developer Token do Google Ads:')
  console.log('GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token')
  console.log('GOOGLE_ADS_CUSTOMER_ID=seu_customer_id (sem hífens)')
}

const code = process.argv[2]

if (code) {
  exchangeCode(code)
} else {
  getAuthUrl()
}
