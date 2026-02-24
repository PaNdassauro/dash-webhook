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

// Leads Pipelines: 1 (SDR), 3 (Closer), 4 (Planejamento), 17 (Internacional), 31 (Desqualificados)
const LEADS_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings', 'WW - Internacional', 'Outros Desqualificados | Wedding']

// MQL Pipelines: only 1 (SDR), 3 (Closer), 4 (Planejamento)
const MQL_PIPELINES = ['SDR Weddings', 'Closer Weddings', 'Planejamento Weddings']

// Helper to check if a date falls within a specific month
function isInMonth(dateStr: string | null, year: number, month: number): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

// Helper to check if deal is Elopement (title starts with EW only)
// DW = Destination Wedding, counts in WW General
function isElopementTitle(title: string | null): boolean {
  if (!title) return false
  return title.startsWith('EW')
}

// Helper to check if deal was created in a specific month
function isCreatedInMonth(deal: Deal, year: number, month: number): boolean {
  if (!deal.created_at) return false
  const date = new Date(deal.created_at)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

// Calculate funnel metrics from deals
// WW Funnel: Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Closer Agendada -> Closer Realizada -> Venda
export function calculateFunnelMetrics(deals: Deal[], year: number, month: number): FunnelMetrics {
  // Leads: pipes 1, 3, 4, 17, 31 + exclude EW titles + CREATED IN MONTH
  const leadsDeals = deals.filter(d =>
    d.pipeline &&
    LEADS_PIPELINES.includes(d.pipeline) &&
    !isElopementTitle(d.title) &&
    isCreatedInMonth(d, year, month)
  )

  // MQL: only pipes 1, 3, 4 + exclude EW titles + CREATED IN MONTH
  const mqlDeals = deals.filter(d =>
    d.pipeline &&
    MQL_PIPELINES.includes(d.pipeline) &&
    !isElopementTitle(d.title) &&
    isCreatedInMonth(d, year, month)
  )

  // All WW deals (for metrics that can include deals created in other months)
  const allWwDeals = deals.filter(d =>
    d.pipeline &&
    LEADS_PIPELINES.includes(d.pipeline) &&
    !isElopementTitle(d.title)
  )

  return {
    leads: leadsDeals.length,
    mql: mqlDeals.length,
    // Agendamento: data_reuniao_1 falls within the selected month (can be from other months)
    agendamento: allWwDeals.filter(d => isInMonth(d.data_reuniao_1, year, month)).length,
    // Reuniao: agendamento in month + como_reuniao_1 filled + not "Não teve reunião"
    reunioes: allWwDeals.filter(d =>
      isInMonth(d.data_reuniao_1, year, month) &&
      d.como_reuniao_1 !== null &&
      d.como_reuniao_1 !== '' &&
      d.como_reuniao_1 !== 'Não teve reunião'
    ).length,
    // Qualificado: data_qualificado in month OR qualificado_sql = true
    qualificado: allWwDeals.filter(d =>
      isInMonth(d.data_qualificado, year, month) ||
      d.qualificado_sql === true
    ).length,
    // Closer Agendada: data_closer falls within the selected month OR deal created in month has data_closer filled
    closerAgendada: allWwDeals.filter(d =>
      isInMonth(d.data_closer, year, month) ||
      (d.data_closer !== null && d.data_closer !== '')
    ).length,
    // Closer Realizada: field 299 "WW | Como foi feita Reunião Closer" is filled
    closerRealizada: allWwDeals.filter(d => d.reuniao_closer !== null && d.reuniao_closer !== '').length,
    // Venda: data_fechamento falls within the selected month (can be from other months)
    vendas: allWwDeals.filter(d => isInMonth(d.data_fechamento, year, month)).length,
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
    // Fetch from cache (updated daily by cron)
    const { data, error } = await supabase
      .from('ads_spend_cache')
      .select('spend, impressions, clicks, cpc, cpm')
      .eq('year', year)
      .eq('month', month)
      .eq('source', 'meta_ads')
      .eq('pipeline', pipeline)
      .maybeSingle()

    if (error || !data) {
      console.error('Error fetching Meta Ads from cache:', error)
      return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
    }

    return {
      spend: Number(data.spend) || 0,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      cpc: Number(data.cpc) || 0,
      cpm: Number(data.cpm) || 0,
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
    // Fetch from cache (updated daily by cron)
    const { data, error } = await supabase
      .from('ads_spend_cache')
      .select('spend, impressions, clicks, cpc, cpm')
      .eq('year', year)
      .eq('month', month)
      .eq('source', 'google_ads')
      .is('pipeline', null)
      .maybeSingle()

    if (error || !data) {
      console.error('Error fetching Google Ads from cache:', error)
      return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
    }

    return {
      spend: Number(data.spend) || 0,
      impressions: data.impressions || 0,
      clicks: data.clicks || 0,
      cpc: Number(data.cpc) || 0,
      cpm: Number(data.cpm) || 0,
    }
  } catch (error) {
    console.error('Error fetching Google Ads data:', error)
    return { spend: 0, impressions: 0, clicks: 0, cpc: 0, cpm: 0 }
  }
}
