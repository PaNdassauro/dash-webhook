# Funnel Field Mapping - Welcome Weddings Dashboard

## Overview

This document maps Active Campaign fields to dashboard funnel metrics for the WW (Welcome Weddings) and Elopement views.

---

## REGRAS IMPORTANTES

### Identificação de Elopement vs WW

Um deal é considerado **Elopement** se:
- Está no pipeline 12 (Elopment Wedding) **OU**
- O título começa com "EW"

**Prefixos de título:**
- **EW** = Elopement Wedding → conta no Elopement
- **DW** = Destination Wedding → conta no WW General

**IMPORTANTE**: Mesmo que um deal esteja nos pipes de WW (1, 3, 4, 17, 31), se o título começar com "EW", ele é Elopement e NÃO deve contar no WW General.

### Regras de Contagem por Métrica

| Métrica | Pipelines | Filtro de Data | Filtro de Título |
|---------|-----------|----------------|------------------|
| **Leads (WW)** | 1, 3, 4, 17, 31 | Criado no mês | Excluir EW |
| **MQL** | 1, 3, 4 apenas | Criado no mês | Excluir EW |
| **Vendas (WW)** | - | data_fechamento no mês | Excluir EW |
| **Leads (Elopement)** | 12 OU título EW | Criado no mês | - |
| **Vendas (Elopement)** | 12 OU título EW | data_fechamento no mês | - |

---

## Pipelines

| Pipe # | Name | Type | In Dashboard |
|--------|------|------|--------------|
| 1 | SDR Weddings | WW | Yes - Full funnel |
| 3 | Closer Weddings | WW | Yes - Full funnel |
| 4 | Planejamento Weddings | WW | Yes - Full funnel |
| 12 | Elopment Wedding | Elopement | Yes - Simplified (Leads → Vendas) |
| 17 | WW - Internacional | WW | Yes - Full funnel |
| 31 | Outros Desqualificados \| Wedding | WW | Yes - Full funnel |

---

## WW Funnel (8 Stages)

```
Lead → MQL → Agendamento → Reunião → Qualificado → Closer Agendada → Closer Realizada → Venda
```

| # | Stage | Field (Deal) | AC Field ID | DB Column | Logic |
|---|-------|-------------|-------------|-----------|-------|
| 1 | **Lead** | Deal created | - | `created_at` | Created in month + Pipeline IN (1, 3, 4, 17, 31) + Title NOT starts with EW |
| 2 | **MQL** | Pipeline | - | `pipeline` | Created in month + Pipeline IN (1, 3, 4) only + Title NOT starts with EW |
| 3 | **Agendamento** | `Data e horário do agendamento da 1ª reunião` | 6 | `data_reuniao_1` | Date falls within selected month |
| 4 | **Reunião** | `Como foi feita a 1ª reunião?` | 17 | `como_reuniao_1` | Agendamento in month + filled + != "Não teve reunião" |
| 5 | **Qualificado** | `Automático - WW - Data Qualificação SDR` + `Qualificado para SQL` | 93 / 169 | `data_qualificado` / `qualificado_sql` | Date in month OR sql = true |
| 6 | **Closer Agendada** | `Data e horário do agendamento com a Closer:` | 18 | `data_closer` | Date in month OR (created in month + field filled) |
| 7 | **Closer Realizada** | `WW \| Como foi feita Reunião Closer` | 299 | `reuniao_closer` | Field is filled |
| 8 | **Venda** | `[WW] [Closer] Data-Hora Ganho` | 87 | `data_fechamento` | data_fechamento in month (pode ser lead criado em outro mês) |

---

## Elopement Funnel (Simplified)

```
Lead → Venda
```

| # | Stage | Logic |
|---|-------|-------|
| 1 | **Lead** | Pipeline = "Elopment Wedding" (12) **OU** título começa com "EW" |
| 2 | **Venda** | data_fechamento in month |

*Note: Elopement deals don't track intermediate funnel stages (MQL, Reunião, etc.)*

---

## Dashboard Views

### 1. WW General (Full Funnel)

**Filtros aplicados:**
- `is_elopement = false`
- `title NOT ILIKE 'EW%'`
- Pipeline IN (1, 3, 4, 17, 31) para Leads
- Pipeline IN (1, 3, 4) para MQL

**Colunas**: All 8 funnel stages + CVR + CPL

### 2. Elopement (Simplified)

**Filtros aplicados:**
- `is_elopement = true` **OU** `title ILIKE 'EW%'`

**Colunas**: Leads, Vendas, CVR

### 3. Total (Combined)

- **Leads**: WW + Elopement
- **Funnel metrics**: WW only (Elopement doesn't track intermediate stages)

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

## Exemplos de Casos Especiais

### Caso 1: Deal com título "EW | Karen e Paulo" no pipeline "Planejamento Weddings"

- **NÃO conta** como Lead no WW General (título começa com EW)
- **NÃO conta** como MQL no WW General (título começa com EW)
- **CONTA** como Elopement Lead
- Se tiver data_fechamento no mês, **CONTA** como Elopement Venda

### Caso 2: Deal com título "DW | Laura e Valdir" no pipeline "Planejamento Weddings"

- **CONTA** como Lead no WW General (DW = Destination Wedding)
- **CONTA** como MQL no WW General
- Segue o funil completo WW
- **NÃO conta** como Elopement

### Caso 3: Deal normal no pipeline "SDR Weddings"

- **CONTA** como Lead no WW General
- **CONTA** como MQL no WW General
- Segue o funil completo WW
