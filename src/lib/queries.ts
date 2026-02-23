import { supabase } from './supabase'
import type { Deal, FunnelMetrics, MonthlyTarget, ViewType } from './types'
import { getMonthDateRange } from './utils'

// Fetch deals for a specific month and view type
export async function fetchDealsForMonth(
  year: number,
  month: number,
  viewType: ViewType
): Promise<Deal[]> {
  const { start, end } = getMonthDateRange(year, month)

  if (viewType === 'elopement') {
    // Elopement: is_elopement = true OR title starts with 'EW'
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .or('is_elopement.eq.true,title.ilike.EW%')

    if (error) {
      console.error('Error fetching elopement deals:', error)
      return []
    }
    return data as Deal[]
  } else {
    // Wedding: is_elopement = false AND title doesn't start with 'EW'
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .eq('is_elopement', false)
      .not('title', 'ilike', 'EW%')

    if (error) {
      console.error('Error fetching wedding deals:', error)
      return []
    }
    return data as Deal[]
  }
}

// MQL pipelines: 1 (SDR Weddings), 3 (Closer Weddings), 4 (Planejamento Weddings)
const MQL_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings']

// Helper to check if a date falls within a specific month
function isInMonth(dateStr: string | null, year: number, month: number): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

// Calculate funnel metrics from deals
// WW Funnel: Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Closer Agendada -> Closer Realizada -> Venda
export function calculateFunnelMetrics(deals: Deal[], year: number, month: number): FunnelMetrics {
  return {
    leads: deals.length,
    // MQL: deals in pipelines 1, 3, or 4 (SDR, Closer, Planejamento)
    mql: deals.filter(d => d.pipeline && MQL_PIPELINES.includes(d.pipeline)).length,
    // Agendamento: data_reuniao_1 falls within the selected month
    agendamento: deals.filter(d => isInMonth(d.data_reuniao_1, year, month)).length,
    // Reuniao: agendamento in month + como_reuniao_1 filled + not "Não teve reunião"
    reunioes: deals.filter(d =>
      isInMonth(d.data_reuniao_1, year, month) &&
      d.como_reuniao_1 !== null &&
      d.como_reuniao_1 !== '' &&
      d.como_reuniao_1 !== 'Não teve reunião'
    ).length,
    // Qualificado: data_qualificado in month OR qualificado_sql = true
    qualificado: deals.filter(d =>
      isInMonth(d.data_qualificado, year, month) ||
      d.qualificado_sql === true
    ).length,
    // Closer Agendada: data_closer falls within the selected month OR deal created in month has data_closer filled
    closerAgendada: deals.filter(d =>
      isInMonth(d.data_closer, year, month) ||
      (d.data_closer !== null && d.data_closer !== '')
    ).length,
    // Closer Realizada: field 299 "WW | Como foi feita Reunião Closer" is filled
    closerRealizada: deals.filter(d => d.reuniao_closer !== null && d.reuniao_closer !== '').length,
    // Venda: data_fechamento falls within the selected month
    // (EW deals are already filtered out at query level for WW)
    vendas: deals.filter(d => isInMonth(d.data_fechamento, year, month)).length,
  }
}

// Fetch vendas count based on data_fechamento (not created_at)
export async function fetchVendasForMonth(
  year: number,
  month: number,
  viewType: ViewType
): Promise<{ count: number; deals: Deal[] }> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

  if (viewType === 'elopement') {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .gte('data_fechamento', startDate)
      .lt('data_fechamento', endDate)
      .or('is_elopement.eq.true,title.ilike.EW%')

    if (error) {
      console.error('Error fetching elopement vendas:', error)
      return { count: 0, deals: [] }
    }
    return { count: data?.length || 0, deals: data as Deal[] }
  } else {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .gte('data_fechamento', startDate)
      .lt('data_fechamento', endDate)
      .eq('is_elopement', false)
      .not('title', 'ilike', 'EW%')

    if (error) {
      console.error('Error fetching wedding vendas:', error)
      return { count: 0, deals: [] }
    }
    return { count: data?.length || 0, deals: data as Deal[] }
  }
}

// Fetch monthly target
export async function fetchMonthlyTarget(
  year: number,
  month: number,
  viewType: ViewType
): Promise<MonthlyTarget | null> {
  const monthStr = `${year}-${String(month).padStart(2, '0')}-01`
  const pipelineType = viewType === 'elopement' ? 'elopement' : 'wedding'

  const { data, error } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('month', monthStr)
    .eq('pipeline_type', pipelineType)
    .maybeSingle()

  if (error) {
    console.error('Error fetching target:', error)
    return null
  }

  return data as MonthlyTarget | null
}

// Fetch previous month metrics for comparison
export async function fetchPreviousMonthMetrics(
  year: number,
  month: number,
  viewType: ViewType
): Promise<FunnelMetrics> {
  let prevYear = year
  let prevMonth = month - 1

  if (prevMonth === 0) {
    prevMonth = 12
    prevYear = year - 1
  }

  const deals = await fetchDealsForMonth(prevYear, prevMonth, viewType)
  return calculateFunnelMetrics(deals, prevYear, prevMonth)
}

// Get all available months with data
export async function getAvailableMonths(): Promise<{ year: number; month: number }[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('created_at')
    .order('created_at', { ascending: true })

  if (error || !data) {
    return []
  }

  const months = new Set<string>()
  data.forEach(d => {
    if (d.created_at) {
      const date = new Date(d.created_at)
      months.add(`${date.getFullYear()}-${date.getMonth() + 1}`)
    }
  })

  return Array.from(months).map(m => {
    const [year, month] = m.split('-').map(Number)
    return { year, month }
  })
}

// Meta Ads spend data
export interface MetaAdsData {
  spend: number
  impressions: number
  clicks: number
  cpc: number
  cpm: number
}

export async function fetchMetaAdsSpend(
  year: number,
  month: number,
  pipeline: ViewType
): Promise<MetaAdsData> {
  try {
    const response = await fetch(
      `/api/meta-ads?year=${year}&month=${month}&pipeline=${pipeline}`
    )

    if (!response.ok) {
      console.error('Meta Ads API error:', response.status)
      return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
    }

    const data = await response.json()
    return {
      spend: data.spend || 0,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      cpc: data.cpc || 0,
      cpm: data.cpm || 0,
    }
  } catch (error) {
    console.error('Error fetching Meta Ads data:', error)
    return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
  }
}

// Google Ads spend data (same interface as Meta)
export async function fetchGoogleAdsSpend(
  year: number,
  month: number
): Promise<MetaAdsData> {
  try {
    const response = await fetch(
      `/api/google-ads?year=${year}&month=${month}`
    )

    if (!response.ok) {
      console.error('Google Ads API error:', response.status)
      return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
    }

    const data = await response.json()
    return {
      spend: data.spend || 0,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      cpc: data.cpc || 0,
      cpm: data.cpm || 0,
    }
  } catch (error) {
    console.error('Error fetching Google Ads data:', error)
    return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
  }
}
