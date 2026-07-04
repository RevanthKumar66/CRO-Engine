# Shopify CRO Opportunity Engine — API Documentation

This document describes the structured JSON endpoints exposed by the backend layer of the Shopify CRO Opportunity Engine.

---

## 1. Extract Website Details

Preprocesses and parses raw HTML layouts, headings, CTAs, collections, products, and navigation tags of a storefront into a minified, token-efficient JSON WebsiteSnapshot object.

* **Endpoint**: `POST /api/v1/extract`
* **Content-Type**: `application/json`
* **Status Codes**:
  * `200 OK`: Extraction succeeded.
  * `400 Bad Request`: Validation errors or blocked loopback/SSRF targets.
  * `500 Internal Server Error`: Parsing/crawling timeout or connection errors.

### Request Payload
```json
{
  "url": "https://example-shopify-store.com"
}
```

### Response Payload
```json
{
  "success": true,
  "data": {
    "storeUrl": "https://example-shopify-store.com",
    "isShopify": true,
    "crawledAt": "2026-07-04T12:00:00.000Z",
    "navigation": {
      "links": [
        { "label": "Shop All", "url": "/collections/all" }
      ],
      "logoText": "Mock Store"
    },
    "globalTrust": {
      "hasSecureConnection": true,
      "trustBadges": ["secure-checkout"],
      "paymentIcons": ["visa", "mastercard"],
      "shippingInfo": "Free shipping worldwide",
      "returnPolicy": "30-day refund guarantee"
    },
    "pages": [
      {
        "url": "https://example-shopify-store.com",
        "pageType": "homepage",
        "metadata": {
          "title": "Welcome to Mock Store",
          "metaDescription": "Buy premium mock products here."
        },
        "headings": [
          { "tag": "h1", "text": "Premium Mock Collection" }
        ],
        "ctas": [
          { "label": "Shop Now", "url": "/collections/all" }
        ],
        "cleanedTextSnippet": "Minified text block from layout..."
      }
    ]
  }
}
```

---

## 2. Analyze Storefront Heuristics

Runs the complete crawl-to-AI analysis pipeline. Generates a preprocessed snapshot, triggers the Gemini self-correction analysis reasoning loops, and persists the final audit report in MongoDB.

* **Endpoint**: `POST /api/v1/analyze`
* **Content-Type**: `application/json`
* **Status Codes**:
  * `200 OK`: Audit succeeded and report persisted.
  * `400 Bad Request`: Payload validation failures or blocked private URLs.
  * `502 Bad Gateway`: AI pipeline failed to parse or correct outputs.
  * `500 Internal Server Error`: DB persistence failures or network timeouts.

### Request Payload
```json
{
  "url": "https://example-shopify-store.com"
}
```

### Response Payload
```json
{
  "success": true,
  "data": {
    "id": "aud_g8f2k9a1",
    "storeUrl": "https://example-shopify-store.com",
    "overallScore": 84,
    "analyzedAt": "2026-07-04T12:05:00.000Z",
    "pageScores": {
      "homepage": 80,
      "pdp: 85,
      "collection": 80,
      "cart": 91
    },
    "recommendations": [
      {
        "id": "rec_0_f3a1",
        "pageType": "cart",
        "category": "cta",
        "finding": "Checkout button uses low-contrast background.",
        "rationale": "High contrast CTAs improve user focus and conversion rates.",
        "actionSteps": [
          "Change CTA color to Royal Blue (#1e40af)."
        ],
        "impact": "HIGH",
        "effort": "LOW"
      }
    ]
  }
}
```

---

## 3. Error Responses

Errors use a unified envelope structure:

```json
{
  "success": false,
  "error": {
    "code": "ERR_VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "url": {
        "_errors": ["Must be a valid absolute URL"]
      }
    }
  }
}
```

### Standard Error Codes
* `ERR_INVALID_URL` (400): URL is empty or represents a blocked private network / loopback address.
* `ERR_VALIDATION_ERROR` (400): Body parameters do not match requested schema bounds.
* `ERR_NOT_SHOPIFY_STORE` (400): Store lacks Shopify identifiers.
* `ERR_AI_VALIDATION_FAILED` (502): Gemini response failed Zod validations after self-correction retries.
* `ERR_NOT_FOUND` (404): No record matches requested audit query ID.
* `ERR_INTERNAL_SERVER_ERROR` (500): Database persistence failures or connection errors.
