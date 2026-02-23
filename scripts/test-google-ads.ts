import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID
const LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN

interface TokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

async function test() {
  console.log('Testing Google Ads API...\n')
  console.log('Customer ID:', CUSTOMER_ID)
  console.log('Login Customer ID (MCC):', LOGIN_CUSTOMER_ID)
  console.log('Developer Token:', DEVELOPER_TOKEN?.substring(0, 10) + '...')
  console.log('')

  // Get access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const tokenData: TokenResponse = await tokenRes.json()

  if (tokenData.error) {
    console.error('Token error:', tokenData.error_description || tokenData.error)
    return
  }

  console.log('✓ Access token obtained\n')

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks
    FROM customer
    WHERE segments.date BETWEEN '2026-02-01' AND '2026-02-23'
  `

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${tokenData.access_token}`,
    'developer-token': DEVELOPER_TOKEN!,
    'Content-Type': 'application/json',
  }

  if (LOGIN_CUSTOMER_ID) {
    headers['login-customer-id'] = LOGIN_CUSTOMER_ID
  }

  // First, try to list accessible customers
  console.log('\nListing accessible customers...')
  const listRes = await fetch(
    'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': DEVELOPER_TOKEN!,
      },
    }
  )

  const listText = await listRes.text()
  console.log('List customers status:', listRes.status)
  console.log('List customers response:', listText.substring(0, 500))

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${CUSTOMER_ID}/googleAds:search`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  )

  const text = await res.text()
  console.log('Raw response status:', res.status)
  console.log('Raw response:', text.substring(0, 500))

  let data
  try {
    data = JSON.parse(text)
  } catch {
    console.error('Failed to parse JSON response')
    return
  }

  if (data.error) {
    console.error('Google Ads API Error:', JSON.stringify(data.error, null, 2))
    return
  }

  console.log('✓ Google Ads API Response:')
  console.log(JSON.stringify(data, null, 2))

  // Parse results
  if (data.results && data.results.length > 0) {
    let totalCost = 0
    let totalImpressions = 0
    let totalClicks = 0

    for (const result of data.results) {
      totalCost += parseInt(result.metrics?.costMicros || '0')
      totalImpressions += parseInt(result.metrics?.impressions || '0')
      totalClicks += parseInt(result.metrics?.clicks || '0')
    }

    console.log('\n=== RESUMO ===')
    console.log(`Gasto: R$ ${(totalCost / 1_000_000).toFixed(2)}`)
    console.log(`Impressões: ${totalImpressions.toLocaleString('pt-BR')}`)
    console.log(`Cliques: ${totalClicks.toLocaleString('pt-BR')}`)
  }
}

test().catch(console.error)
