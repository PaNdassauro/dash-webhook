# Mapeamento ActiveCampaign -> Funil Revenue Intelligence

## Unidades de Negocio

| Sigla | Nome Completo | Tipo |
|-------|--------------|------|
| **WW** | Welcome Weddings | Destination Weddings |
| **WT** | Welcome Trips | Viagens / Experiencias |

> WC (WelConnect) existe no AC mas **nao entra no funil de vendas**.
> DW (Destination Wedding operacional) e sub-tipo do WW (briefing pos-venda).

---

## FUNIL WW (Welcome Weddings) — 8 etapas

| # | Etapa | Campo Decisor (Deal) | ID | Campo Decisor (Contact) | ID | Logica |
|---|-------|---------------------|----|------------------------|----|--------|
| 1 | **Lead** | Deal criado no pipeline WW | - | - | - | Deal existe |
| 2 | **MQL** | `Motivos de qualificacao SDR` | 83 | `WW\|SDR\|Motivo de Qualificacao` | 383 | Campo preenchido |
| 3 | **Agendamento** | `Data e horario do agendamento da 1a reuniao` | 6 | `WW\|SDR\|Agendamento` | 380 | Data preenchida |
| 4 | **Reuniao** | `Como foi feita a 1a reuniao?` | 17 | `WW\|SDR\|Como foi feita` | 381 | Campo preenchido |
| 5 | **Qualificado** | - | - | `WW - Data Qualificacao SDR` | 144 | Data preenchida |
| 6 | **Closer Agendada** | `Data e horario do agendamento com a Closer:` | 18 | `WW\|Closer\|Agendamento` | 384 | Data preenchida |
| 7 | **Closer Realizada** | `Tipo da reuniao com a Closer:` | 19 | `WW\|Closer\|Como foi feita` | 385 | Campo preenchido |
| 8 | **Venda** | Deal status = `won` / `[WW] [Closer] Data-Hora Ganho` | 87 | `WW\|Closer\|Data Ganho` | 387 | Deal ganho |

**Perda:** `[WW] [Closer] Motivo de Perda` (Deal 47) ou `WW - Motivo de Perda` (Contact 131)

### Valor da Venda (WW):
| Campo | ID | Tipo |
|-------|-----|------|
| `Valor fechado em contrato:` | 64 (Deal) | **Valor final** |
| `Orcamento:` | 7 (Deal) | Orcamento estimado |
| `WW - Investimento 2` | 8 (Contact) | Investimento estimado |

---

## FUNIL WT (Welcome Trips) — 6 etapas (SEM Closer)

| # | Etapa | Campo Decisor (Deal) | ID | Campo Decisor (Contact) | ID | Logica |
|---|-------|---------------------|----|------------------------|----|--------|
| 1 | **Lead** | Deal criado no pipeline WT | - | - | - | Deal existe |
| 2 | **MQL** | `[WT]Origem da ultima conversao:` | 85 | UTMs preenchidas | 46-48 | Origem rastreada |
| 3 | **Agendamento** | `Data e horario do agendamento da 1a. Reuniao SDR TRIPS` | 166 | `WT - Agendamento Calendly` | 378 | Data preenchida |
| 4 | **Reuniao** | `Como foi feita a 1a. Reuniao SDR TRIPS` | 167 | - | - | Campo preenchido |
| 5 | **Qualificado** | `Qualificado para SQL` | 169 | - | - | Campo = sim |
| 6 | **Venda** | Deal status = `won` / `VND WT - Qual valor da venda?` | 91 | - | - | Deal ganho |

**Perda:** `SDR WT - Motivo de Perda` (Deal 56) ou `VND WT - Motivo Perda` (Deal 192)

### Valor da Venda (WT):
| Campo | ID | Tipo |
|-------|-----|------|
| `VND WT - Qual valor da venda?` | 91 (Deal) | **Valor final** |
| `WT Investimento por Pessoa` | 263 (Deal) / 302 (Contact) | Investimento por pessoa |
| `Numero da Venda MONDE` | 68 (Deal) | ID venda no Monde |

---

## UTMs / Atribuicao (CONTACT Fields):

| Campo | ID |
|-------|-----|
| `utm source` | 46 |
| `utm medium` | 47 |
| `utm campaign` | 48 |
| `utm_content` | 208 |
| `utm_term` | 207 |
| `Data da primeira conversao` | 30 |
| `Conversao Total` | 50 |
| `1a conversao no formulario` | 53 |
| `Ultima conversao` | 56 |
| `Origem da ultima conversao:` | 137 |

---

## Campos de CONVIDADOS (WW sub-pipeline):

Pipeline separado para convidados de casamento:
- `WW-Convidado-DDI` (147), `Grupo de Convite` (148), `Observacao do Convite` (149)
- `Tarifa Promocional` (150), `Genero` (151), `Tipo` (152)
- `Codigo do Casamento` (153), `Situacao` (154), `Mesa` (155)
- Versoes "BWW-" (99-107) para deals de convidados

---

## RESUMO FINAL

### WW (8 etapas):
```
Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Closer Ag. -> Closer Real. -> Venda
```

### WT (6 etapas, sem Closer):
```
Lead -> MQL -> Agendamento -> Reuniao -> Qualificado -> Venda
```
