# Deal Fields - Dashboard Usage

Fields selected for the dashboard from Active Campaign Deals.

---

## Standard Deal Fields (No Custom Field ID)

These are built-in Active Campaign deal properties:

| Dashboard Name | AC Property | Description |
|----------------|-------------|-------------|
| id | `id` | Deal ID |
| Deal Title | `title` | Deal title/name |
| Group | `group` | Pipeline group |
| Stage | `stage` | Current stage in pipeline |
| Status | `status` | Deal status (open/won/lost) |
| Criado em | `cdate` | Created date |
| Atualizado em | `mdate` | Updated date |

---

## Custom Deal Fields

| Dashboard Name | AC Field Name | Field ID | Type |
|----------------|---------------|----------|------|
| Nome do Noivo | Nome do Noivo(a)2 | 14 | Deal |
| Convidados | Número de convidados: | 8 | Deal |
| Orçamento | Orçamento: | 7 | Deal |
| Destino | Destino | 121 | Deal |
| Motivo de perda | Motivo de perda | 2 | Deal |
| Data e horário do agendamento da 1ª reunião | Data e horário do agendamento da 1ª reunião | 6 | Deal |
| Como foi feita a 1ª reunião? | Como foi feita a 1ª reunião? | 17 | Deal |
| Qualificado para SQL | Qualificado para SQL | 169 | Deal |
| Data e horário do agendamento com a Closer | Data e horário do agendamento com a Closer: | 18 | Deal |
| Reunião feita com a Closer | WW \| Como foi feita Reunião Closer | 299 | Deal |
| Data Fechamento Assessoria | [WW] [Closer] Data-Hora Ganho | 87 | Deal |

---

## Field ID Quick Reference

```typescript
const DEAL_CUSTOM_FIELDS = {
  nomeNoivo: 14,
  convidados: 8,
  orcamento: 7,
  destino: 121,
  motivoPerda: 2,
  dataHoraReuniao1: 6,
  comoFoiFeitaReuniao1: 17,
  qualificadoSQL: 169,
  dataHoraCloser: 18,
  reuniaoCloser: 299,
  dataFechamentoAssessoria: 87,
} as const;
```

---

## Notes

- Standard fields are accessed directly from the deal object
- Custom fields are accessed via `deal.fields` array where each field has `{ id, value }`
- Field IDs are used in webhook payloads as `field[ID]` format
