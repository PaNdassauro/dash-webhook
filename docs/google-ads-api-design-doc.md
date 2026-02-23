# Welcome Weddings - Google Ads API Integration Design Document

## 1. Overview

**Company:** Welcome Weddings
**Application:** Internal Marketing Dashboard
**Purpose:** Read-only access to Google Ads metrics for internal reporting

## 2. Business Use Case

Welcome Weddings is a destination wedding planning company. We run Google Ads campaigns to acquire leads from international markets. This internal dashboard consolidates marketing data to help our team:

- Track advertising spend across platforms (Google Ads + Meta Ads)
- Calculate Cost Per Lead (CPL) and Cost Per Acquisition (CPA)
- Monitor campaign performance over time
- Make data-driven budget allocation decisions

## 3. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internal Dashboard                        │
│                   (Next.js Application)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Route Layer                           │
│                  /api/google-ads                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Google Ads API (v17)                        │
│              Read-only metrics retrieval                     │
└─────────────────────────────────────────────────────────────┘
```

## 4. Data Flow

1. User accesses internal dashboard (authenticated)
2. Dashboard requests metrics for selected month
3. Server-side API route authenticates with Google Ads API using OAuth 2.0
4. Google Ads API returns metrics (spend, impressions, clicks)
5. Dashboard displays aggregated data

## 5. API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/customers/{customerId}/googleAds:search` | POST | Query campaign metrics |

## 6. Data Retrieved

We only retrieve the following read-only metrics:

- `metrics.cost_micros` - Total spend
- `metrics.impressions` - Ad impressions
- `metrics.clicks` - Ad clicks

**We do NOT:**
- Create, modify, or delete campaigns
- Access customer personal data
- Access billing information
- Share data with third parties

## 7. Authentication

- OAuth 2.0 with refresh token
- Server-side only (tokens never exposed to browser)
- Credentials stored securely in environment variables

## 8. Rate Limiting & Best Practices

- Queries are made on-demand when user loads dashboard
- Results are cached to minimize API calls
- Typical usage: < 100 queries per day

## 9. Security Measures

- All credentials stored in secure environment variables
- HTTPS-only communication
- Server-side API calls (no client-side token exposure)
- Internal tool with restricted access

## 10. Contact Information

**Developer:** Welcome Weddings Tech Team
**Email:** tech@welcomeweddings.com
**Website:** https://welcomeweddings.com

---

*Document Version: 1.0*
*Last Updated: February 2026*
