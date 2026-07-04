# Shopify CRO Opportunity Engine - API Contract

This document specifies the REST API endpoints, payload structures, HTTP status mappings, validation rules, and error envelopes. All request and response bodies use JSON format.

---

## Global Headers & Formatting
* **Content-Type**: `application/json`
* **Accept**: `application/json`
* **Rate Limits**: 5 audits per hour per client IP. Standard health and retrieval routes are rate-limited to 60 requests per minute.

---

## Endpoints

### 1. Initiate Store Audit
Triggers scraping, AI extraction, heuristic validation, and recommendation compiling.

* **Method**: `POST`
* **Path**: `/api/v1/audits`
* **Authentication**: None (Public Access for MVP)

#### Request Payload
```json
{
  "url": "https://quickstart-theme-default.myshopify.com"
}
```

#### Request Validation Rules
* `url` (String): Must be a valid absolute URI. Must start with `http://` or `https://`. Must pass basic Shopify validation (cannot resolve to a non-public IP block).

#### Response Payload (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "aud_8f9c0e2a4b12",
    "storeUrl": "https://quickstart-theme-default.myshopify.com",
    "overallScore": 74,
    "analyzedAt": "2026-07-04T12:00:00Z",
    "pageScores": {
      "homepage": 80,
      "pdp": 70,
      "collection": 85,
      "cart": 60
    },
    "recommendations": [
      {
        "id": "rec_01h2x3y4z5",
        "pageType": "pdp",
        "category": "cta",
        "finding": "Add to Cart button is below the mobile fold.",
        "rationale": "Mobile shoppers should not have to scroll to locate the primary conversion action. Keeping the button visible instantly increases cart-add frequency.",
        "actionSteps": [
          "Move the pricing block closer to the title.",
          "Ensure the Add to Cart button height is minimum 48px.",
          "Implement sticky mobile add-to-cart component on scroll."
        ],
        "impact": "HIGH",
        "effort": "MEDIUM"
      },
      {
        "id": "rec_02h9w8v7u6",
        "pageType": "cart",
        "category": "trust",
        "finding": "Cart page lacks trust indicators or security seals near checkout CTA.",
        "rationale": "Trust issues are the primary driver of cart abandonment. Providing clear checkout guarantees resolves buying friction.",
        "actionSteps": [
          "Add small SSL/Secure checkout badges directly below the checkout button.",
          "Include a clear microcopy line: 'Free shipping on orders over $50. Easy returns.'"
        ],
        "impact": "HIGH",
        "effort": "LOW"
      }
    ]
  }
}
```

---

### 2. Retrieve Saved Audit
Fetch historical results using an audit ID.

* **Method**: `GET`
* **Path**: `/api/v1/audits/:id`

#### Route Parameters
* `id` (String): The unique audit ID (prefixed with `aud_`).

#### Response Payload (200 OK)
Same structure as the `POST /api/v1/audits` success response.

---

### 3. Service Health Check
Verify backend availability and external API connectivity status.

* **Method**: `GET`
* **Path**: `/api/v1/health`

#### Response Payload (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-07-04T12:05:00Z",
    "services": {
      "geminiApi": "connected",
      "scraperEngine": "idle"
    }
  }
}
```

---

## Standard Error Schema

All failing requests return a structured error wrapper matching this schema:

```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_URL",
    "message": "The provided URL is not a valid Shopify storefront.",
    "details": {
      "submittedUrl": "https://not-a-store.com",
      "validationError": "No Shopify-specific assets or identifiers found in target HTML."
    }
  }
}
```

### HTTP Status Code Mappings

| Code | Scenario | Payload Code |
| :--- | :--- | :--- |
| **400 Bad Request** | Missing URL parameter, malformed payload, or invalid scheme. | `ERR_INVALID_URL` |
| **404 Not Found** | Audit ID does not exist in the database or cache. | `ERR_AUDIT_NOT_FOUND` |
| **422 Unprocessable** | Storefront was reachable but could not be scraped or parsed correctly. | `ERR_SCRAPING_FAILED` |
| **429 Too Many Requests** | IP has hit the hourly audit creation limit. | `ERR_RATE_LIMIT_EXCEEDED` |
| **500 Server Error** | Gemini API connection failures or unhandled server conditions. | `ERR_INTERNAL_SERVER_ERROR` |
