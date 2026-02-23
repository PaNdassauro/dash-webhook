import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const META_API_VERSION = 'v19.0'
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`

const QuerySchema = z.object({
  year: z.coerce.number().min(2020).max(2100),
  month: z.coerce.number().min(1).max(12),
  pipeline: z.enum(['wedding', 'elopement']).optional().default('wedding'),
})

interface MetaInsightsResponse {
  data?: Array<{
    spend: string
    impressions: string
    clicks: string
    cpc: string
    cpm: string
    date_start: string
    date_stop: string
  }>
  error?: {
    message: string
    type: string
    code: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const parsed = QuerySchema.safeParse({
      year: searchParams.get('year'),
      month: searchParams.get('month'),
      pipeline: searchParams.get('pipeline'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { year, month, pipeline } = parsed.data
    const accessToken = process.env.META_ADS_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Meta Ads access token not configured' },
        { status: 500 }
      )
    }

    // Select account based on pipeline
    const accountId = pipeline === 'elopement'
      ? process.env.META_ADS_ACCOUNT_ELOPEMENT
      : process.env.META_ADS_ACCOUNT_WEDDING

    if (!accountId) {
      return NextResponse.json(
        { error: `Meta Ads account not configured for ${pipeline}` },
        { status: 500 }
      )
    }

    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Build URL with proper encoding
    const url = new URL(`${META_API_BASE}/${accountId}/insights`)
    url.searchParams.set('fields', 'spend,impressions,clicks,cpc,cpm')
    url.searchParams.set('time_range', JSON.stringify({ since: startDate, until: endDate }))
    url.searchParams.set('access_token', accessToken)

    const response = await fetch(url.toString())
    const data: MetaInsightsResponse = await response.json()

    if (data.error) {
      console.error('Meta API Error:', data.error)
      return NextResponse.json(
        { error: data.error.message },
        { status: 400 }
      )
    }

    // Parse the response
    const insights = data.data?.[0]

    return NextResponse.json({
      spend: insights ? parseFloat(insights.spend) : 0,
      impressions: insights ? parseInt(insights.impressions) : 0,
      clicks: insights ? parseInt(insights.clicks) : 0,
      cpc: insights ? parseFloat(insights.cpc) : 0,
      cpm: insights ? parseFloat(insights.cpm) : 0,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      accountId,
      pipeline,
    })
  } catch (error) {
    console.error('Error fetching Meta Ads data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Meta Ads data' },
      { status: 500 }
    )
  }
}
