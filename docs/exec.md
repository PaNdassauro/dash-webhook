Dash Webhook - Dashboard de Vendas e Marketing Welcome Weddings

1. Resumo Executivo

O Dash Webhook é uma plataforma de analytics em tempo real para a Welcome Weddings, unificando dados de CRM (Active Campaign), Meta Ads e Google Ads em um dashboard executivo. O sistema rastreia o funil completo de vendas (8 etapas) correlacionando performance comercial com investimento em marketing, permitindo decisões baseadas em dados sobre ROI e performance de vendas.

Status Atual: Em operação (Dashboard de Vendas estabilizado). Próximo passo: Módulo de Trips.

2. Informações Gerais do Projeto

Campo | Detalhe
--- | ---
Nome do Projeto | Dash Webhook
Descrição Breve | Dashboard de Analytics de Vendas e Marketing para Welcome Weddings (Destination Weddings).
Data de Criação | 2024

3. Detalhes Operacionais

Campo | Detalhe
--- | ---
Ação | Agregação de dados de vendas e ads, visualização de funil, tracking de metas mensais.
Espaço | Turismo, Casamentos Destino, Marketing B2C.
Natureza | Dashboard Analytics / BI Light para nicho de destination weddings.
Líder | Mateus Gabardo

4. Cronograma e Status

Campo | Detalhe
--- | ---
Data Início | 2024
Status Atual | Ativo / Expansão (Módulo de Trips)
Próximos Passos | Configuração completa do módulo de Trips (viagens dos clientes).

5. Escopo do Projeto (Metodologia SMART)

Mensurável: Visualizar ciclo completo de venda (Lead -> MQL -> Reunião -> Qualificado -> Closer -> Venda) com métricas de ads.

Atingível: Utilizando Next.js 14, Supabase, webhooks Active Campaign e APIs Meta/Google Ads.

Relevante: Resolve a falta de visibilidade entre investimento em marketing e resultado em vendas.

Temporizável: Dashboard de vendas operacional; Módulo de Trips em fase inicial (Fev/2026).

Entregáveis

[x] Dashboard Wedding (8 etapas de funil completo).

[x] Dashboard Elopement (funil simplificado).

[x] Dashboard Total (visão consolidada WW + EW).

[x] Integração Active Campaign via Webhook (real-time).

[x] Integração Meta Ads (spend, impressions, clicks, CPC, CPM).

[x] Integração Google Ads com OAuth2.

[x] Sistema de metas mensais (monthly_targets).

[x] Cache de dados de ads com refresh diário (cron 9h).

[x] Autenticação por senha com middleware.

[ ] Módulo de Trips (viagens dos clientes).

[ ] Dashboard de performance de Trips.

Fora de Escopo

Gestão financeira completa (Foco é analytics de vendas e marketing).

Reservas diretas de hotéis/voos (Foco é visualização e tracking).

6. Checkpoints e Marcos

[x] Webhook Active Campaign funcionando em produção.

[x] Integração Meta Ads + Google Ads operacional.

[x] Dashboard responsivo com seletor de mês/ano.

[x] Sistema de metas com cálculo de achievement %.

[x] Deploy Vercel com cron jobs configurados.

[ ] Módulo de Trips - Schema e tabelas.

[ ] Módulo de Trips - Webhook/API de ingestão.

[ ] Módulo de Trips - Dashboard de visualização.

7. Recursos e Orçamento

Recursos Necessários: Desenvolvedor Fullstack, Infraestrutura Supabase (Free/Pro), Vercel (Hobby/Pro).

Orçamento: Alocado para infraestrutura serverless.

8. Riscos e Mitigações

Risco | Mitigação
--- | ---
Rate limits APIs de Ads | Cache diário via `ads_spend_cache` com cron job.
Token Google Ads expirado | Refresh token automático com OAuth2.
Dados inconsistentes Active Campaign | Validação Zod em todos inputs do webhook.
Campos customizados alterados no AC | Mapeamento documentado em `docs/active-campaign-fields.md`.

9. Comunicação e Stakeholders

Líder de Projeto: Mateus Gabardo

Stakeholders: Welcome Weddings, Equipe Comercial (SDR/Planners), Marketing.

10. Observações Adicionais

Stack: Next.js 14, TypeScript, Tailwind CSS, Supabase PostgreSQL.

Integrações: Active Campaign (webhook), Meta Ads API, Google Ads API.

Pipelines: Wedding (WW) com 8 etapas, Elopement (EW) simplificado.

---

PRÓXIMO PASSO: MÓDULO DE TRIPS

Status: Nada implementado ainda.

O que precisa ser feito:

1. [ ] Definir schema de Trips no Supabase (tabela `trips`)
2. [ ] Criar webhook/API para ingestão de dados de viagens
3. [ ] Mapear campos de Trip do Active Campaign
4. [ ] Criar componentes de visualização (TripsDashboard, TripsTable)
5. [ ] Integrar com deals existentes (relacionamento deal -> trips)
6. [ ] Adicionar rota /trips no dashboard
