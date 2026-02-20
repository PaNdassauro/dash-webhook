# Funnel Field Mapping - Welcome Weddings Dashboard

## Overview

This document maps Active Campaign fields to dashboard funnel metrics for the WW (Welcome Weddings) and Elopement views.

---

## Pipelines

| Pipe # | Name | Type | In Dashboard |
|--------|------|------|--------------|
| 1 | SDR Weddings | WW | Yes - Full funnel |
| 3 | Closer Weddings | WW | Yes - Full funnel |
| 4 | Planejamento Weddings | WW | Yes - Full funnel |
| 12 | Elopment Wedding | Elopement | Yes - Simplified (Leads → Vendas) |
| - | WW - Internacional | WW | Yes - Full funnel |
| - | Outros Desqualificados \| Wedding | Excluded | No |

---

## WW Funnel (8 Stages)

```
Lead → MQL → Agendamento → Reunião → Qualificado → Closer Agendada → Closer Realizada → Venda
```

| # | Stage | Field (Deal) | AC Field ID | DB Column | Logic |
|---|-------|-------------|-------------|-----------|-------|
| 1 | **Lead** | Deal created | - | `created_at` | Deal exists in 2026 |
| 2 | **MQL** | Pipeline | - | `pipeline` | Pipeline IN ('SDR Weddings', 'Closer Weddings', 'Planejamento Weddings') |
| 3 | **Agendamento** | `Data e horário do agendamento da 1ª reunião` | 6 | `data_reuniao_1` | Date falls within selected month |
| 4 | **Reunião** | `Como foi feita a 1ª reunião?` | 17 | `como_reuniao_1` | Agendamento in month + filled + != "Não teve reunião" |
| 5 | **Qualificado** | `Automático - WW - Data Qualificação SDR` + `Qualificado para SQL` | 93 / 169 | `data_qualificado` / `qualificado_sql` | Date in month OR sql = true |
| 6 | **Closer Agendada** | `Data e horário do agendamento com a Closer:` | 18 | `data_closer` | Date in month OR (created in month + field filled) |
| 7 | **Closer Realizada** | `WW \| Como foi feita Reunião Closer` | 299 | `reuniao_closer` | Field is filled |
| 8 | **Venda** | `[WW] [Closer] Data-Hora Ganho` | 87 | `data_fechamento` | Date in month + title NOT starts with "EW" |

---

## Elopement Funnel (Simplified)

```
Lead → Venda
```

| # | Stage | Logic |
|---|-------|-------|
| 1 | **Lead** | Deal exists in pipeline "Elopment Wedding" |
| 2 | **Venda** | Deal status = 'Won' |

*Note: Elopement deals don't track intermediate funnel stages (MQL, Reunião, etc.)*

---

## Database Schema

### deals table

| Column | Type | Source |
|--------|------|--------|
| `id` | BIGINT | Deal ID |
| `title` | TEXT | Deal Title |
| `pipeline` | TEXT | Pipeline name |
| `stage` | TEXT | Current stage |
| `status` | TEXT | Open/Won/Lost |
| `created_at` | TIMESTAMPTZ | Created date |
| `updated_at` | TIMESTAMPTZ | Updated date |
| `nome_noivo` | TEXT | Nome do Noivo(a)2 |
| `num_convidados` | INTEGER | Número de convidados |
| `orcamento` | DECIMAL | Orçamento |
| `destino` | TEXT | Destino |
| `motivo_perda` | TEXT | Motivo de perda |
| `motivos_qualificacao_sdr` | TEXT | Motivos de qualificação SDR (field 83) |
| `data_reuniao_1` | TIMESTAMPTZ | Agendamento date (field 6) |
| `como_reuniao_1` | TEXT | How first meeting was done (field 17) |
| `data_qualificado` | TIMESTAMPTZ | Qualification date (field 93) |
| `qualificado_sql` | BOOLEAN | Qualified for SQL (field 169) |
| `data_closer` | TIMESTAMPTZ | Closer scheduled date (field 18) |
| `reuniao_closer` | TEXT | How Closer meeting was done (field 299) |
| `data_fechamento` | TIMESTAMPTZ | Sale closed date (field 87) |
| `is_elopement` | BOOLEAN | Computed: pipeline = 'Elopment Wedding' |

---

## Dashboard Views

### 1. WW General (Full Funnel)

- **Filter**: `is_elopement = false` AND `pipeline != 'Outros Desqualificados | Wedding'`
- **Columns**: All 8 funnel stages + CVR + CPL

### 2. Elopement (Simplified)

- **Filter**: `is_elopement = true`
- **Columns**: Leads, Vendas, CVR

### 3. Total (Combined)

- **Leads**: WW + Elopement
- **Funnel metrics**: WW only (Elopement doesn't track intermediate stages)

---

## Excel Import Columns (deals-used-only.xlsx)

| Col # | Header | Maps To |
|-------|--------|---------|
| 1 | Deal ID | id |
| 2 | Title | title |
| 3 | Pipeline | pipeline |
| 4 | Stage | stage |
| 5 | Status | status |
| 6 | Created | created_at |
| 7 | Updated | updated_at |
| 8 | Nome do Noivo(a)2 | nome_noivo |
| 9 | Número de convidados: | num_convidados |
| 10 | Orçamento: | orcamento |
| 11 | Destino | destino |
| 12 | Motivo de perda | motivo_perda |
| 13 | Motivos de qualificação SDR | motivos_qualificacao_sdr |
| 14 | Data e horário do agendamento da 1ª reunião | data_reuniao_1 |
| 15 | Como foi feita a 1ª reunião? | como_reuniao_1 |
| 16 | Automático - WW - Data Qualificação SDR | data_qualificado |
| 17 | Qualificado para SQL | qualificado_sql |
| 18 | Data e horário do agendamento com a Closer: | data_closer |
| 19 | WW \| Como foi feita Reunião Closer | reuniao_closer |
| 20 | [WW] [Closer] Data-Hora Ganho | data_fechamento |

---

## Verification (January 2026)

| Metric | Expected | Notes |
|--------|----------|-------|
| Leads | 349 | WW + Elopement (excl Desqualificados) |
| MQL | 237 | Pipes 1, 3, 4 only |
| Agendamento | 81 | data_reuniao_1 date in selected month |
| Reuniões | 60 | Agendamento in month + como_reuniao_1 filled + != "Não teve reunião" |
| Qualificado | 46 | data_qualificado in month OR qualificado_sql = true |
| Closer Agendada | 40 | data_closer date in month OR (deal created in month + data_closer filled) |
| Closer Realizada | 38 | reuniao_closer filled |
| Vendas | 2 | data_fechamento in month + title NOT starts with "EW" |
