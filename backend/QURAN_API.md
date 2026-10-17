# Quran API Documentation

## Overview

Custom Quran API with MongoDB storage. Supports full CRUD operations for Surahs and verses, audio file uploads, and full-text search across Arabic text and Bengali meanings.

---

## Quick Start

### 1. Import Quran Data

You need to provide a JSON file with Quran data in this format:

```json
[
  {
    "id": 1,
    "name_ar": "الفاتحة",
    "name_bn": "আল-ফাতিহা",
    "name_en": "Al-Fatihah",
    "type": "meccan",
    "total_verses": 7,
    "order_revelation": 5,
    "verses": [
      {
        "id": 1,
        "text_ar": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        "bn_meaning": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "bn_pronunciation": "Bismillah-ir-Rahman-ir-Rahim"
      },
      {
        "id": 2,
        "text_ar": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        "bn_meaning": "All praise is due to Allah, Lord of the worlds.",
        "bn_pronunciation": "Al-hamdu lillahi rabbi al-aalamin"
      }
    ]
  }
]
```

Then run:

```bash
node scripts/importQuranData.js /path/to/quran-data.json
```

To clear existing data and reimport:

```bash
node scripts/importQuranData.js /path/to/quran-data.json --clear-existing
```

---

## Public API Endpoints

All public endpoints are **GET only** and require no authentication.

### Get All Surahs

```
GET /api/quran
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 114)
- `type` (optional): Filter by type - `meccan` or `medinan`

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name_ar": "الفاتحة",
      "name_bn": "আল-ফাতিহা",
      "name_en": "Al-Fatihah",
      "type": "meccan",
      "total_verses": 7,
      "order_revelation": 5,
      "audio_urls": [],
      "created_at": "2024-05-10T10:00:00Z",
      "updated_at": "2024-05-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 114,
    "page": 1,
    "limit": 114,
    "pages": 1
  }
}
```

**Examples:**

```bash
# Get all Surahs
curl https://siraatul-backend.hcsb.org.bd/api/quran

# Filter by type (Meccan only)
curl https://siraatul-backend.hcsb.org.bd/api/quran?type=meccan

# Pagination
curl https://siraatul-backend.hcsb.org.bd/api/quran?page=2&limit=10
```

---

### Get Available Languages

```
GET /api/quran/languages
```

**Response:**

```json
{
  "languages": ["bn"],
  "description": "Bengali meaning and pronunciation"
}
```

---

### Search Quran

```
GET /api/quran/search
```

**Query Parameters:**

- `q` (optional): Search query (searches in Surah names and verse text/meanings)
- `surahId` (optional): Filter by Surah ID (1-114)
- `verseStart` (optional): Start verse number
- `verseEnd` (optional): End verse number

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name_ar": "الفاتحة",
      "name_bn": "আল-ফাতিহা",
      "name_en": "Al-Fatihah",
      "type": "meccan",
      "total_verses": 7,
      "verses": [
        {
          "id": 1,
          "text_ar": "بِسْمِ اللَّهِ...",
          "bn_meaning": "In the name of Allah...",
          "bn_pronunciation": "Bismillah...",
          "audio_sources": []
        }
      ],
      "audio_urls": []
    }
  ],
  "count": 1
}
```

**Examples:**

```bash
# Search by Surah name
curl https://siraatul-backend.hcsb.org.bd/api/quran/search?q=Al-Fatihah

# Get specific verse range
curl "https://siraatul-backend.hcsb.org.bd/api/quran/search?surahId=1&verseStart=1&verseEnd=7"

# Search in Bengali text
curl "https://siraatul-backend.hcsb.org.bd/api/quran/search?q=আল-ফাতিহা"
```

---

### Get Single Surah

```
GET /api/quran/surah/:surahId
```

**Response:**

```json
{
  "id": 1,
  "name_ar": "الفاتحة",
  "name_bn": "আল-ফাতিহা",
  "name_en": "Al-Fatihah",
  "type": "meccan",
  "total_verses": 7,
  "order_revelation": 5,
  "verses": [
    {
      "id": 1,
      "text_ar": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "bn_meaning": "In the name of Allah...",
      "bn_pronunciation": "Bismillah...",
      "audio_sources": [
        {
          "title": "Qari Ahmed Al-Ajmi",
          "url": "/files/quran/surah/...",
          "format": "mp3"
        }
      ]
    }
  ],
  "audio_urls": [
    {
      "title": "Full Surah - Ahmed Al-Ajmi",
      "url": "/files/quran/surah/...",
      "format": "mp3"
    }
  ]
}
```

**Example:**

```bash
curl https://siraatul-backend.hcsb.org.bd/api/quran/surah/1
```

---

### Get Single Verse

```
GET /api/quran/surah/:surahId/verse/:verseId
```

**Response:**

```json
{
  "surah": {
    "id": 1,
    "name_ar": "الفاتحة",
    "name_bn": "আল-ফাতিহা",
    "name_en": "Al-Fatihah"
  },
  "verse": {
    "id": 1,
    "text_ar": "بِسْمِ اللَّهِ...",
    "bn_meaning": "In the name of Allah...",
    "bn_pronunciation": "Bismillah...",
    "audio_sources": []
  }
}
```

**Example:**

```bash
curl https://siraatul-backend.hcsb.org.bd/api/quran/surah/1/verse/1
```

---

## Admin API Endpoints

All admin endpoints require:

1. **JWT Token** in Authorization header: `Authorization: Bearer {token}`
2. **Admin Role** in JWT payload: `role: "admin"`

Token should be obtained from login endpoint. Admin user must have `role: "admin"` in their JWT token.

---

### Create New Surah

```
POST /api/quran/admin/surah
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "id": 2,
  "name_ar": "البقرة",
  "name_bn": "আল-বাকারাহ",
  "name_en": "Al-Baqarah",
  "type": "medinan",
  "total_verses": 286,
  "order_revelation": 87,
  "verses": [
    {
      "id": 1,
      "text_ar": "الم",
      "bn_meaning": "Alif, Lam, Meem.",
      "bn_pronunciation": "Alif Laam Meem"
    }
  ]
}
```

**Response (201):**

```json
{
  "data": {
    /* full Surah object */
  },
  "message": "Surah created successfully"
}
```

**Example:**

```bash
curl -X POST https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 2,
    "name_ar": "البقرة",
    "name_bn": "আল-বাকারাহ",
    "name_en": "Al-Baqarah",
    "type": "medinan",
    "total_verses": 286,
    "verses": []
  }'
```

---

### Update Surah Metadata

```
PUT /api/quran/admin/surah/:surahId
Authorization: Bearer {token}
```

**Request Body (partial):**

```json
{
  "name_ar": "الفاتحة (Updated)",
  "order_revelation": 6
}
```

**Updatable Fields:**

- `name_ar`, `name_bn`, `name_en`
- `type` (meccan/medinan)
- `order_revelation`

**Response (200):**

```json
{
  "data": {
    /* updated Surah object */
  },
  "message": "Surah updated successfully"
}
```

**Example:**

```bash
curl -X PUT https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name_en": "The Opening (Updated)"}'
```

---

### Update Single Verse

```
PUT /api/quran/admin/surah/:surahId/verse/:verseId
Authorization: Bearer {token}
```

**Request Body (partial):**

```json
{
  "text_ar": "updated text",
  "bn_meaning": "updated meaning",
  "bn_pronunciation": "updated pronunciation"
}
```

**Updatable Fields:**

- `text_ar`
- `bn_meaning`
- `bn_pronunciation`

**Response (200):**

```json
{
  "data": {
    /* updated verse object */
  },
  "message": "Verse updated successfully"
}
```

---

### Delete Surah

```
DELETE /api/quran/admin/surah/:surahId
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "data": {
    /* deleted Surah object */
  },
  "message": "Surah deleted successfully"
}
```

**⚠️ Warning:** This deletes the entire Surah and all its verses.

**Example:**

```bash
curl -X DELETE https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1 \
  -H "Authorization: Bearer {token}"
```

---

### Delete Single Verse

```
DELETE /api/quran/admin/surah/:surahId/verse/:verseId
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "data": {
    /* updated Surah object */
  },
  "message": "Verse deleted successfully"
}
```

**Example:**

```bash
curl -X DELETE https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1/verse/1 \
  -H "Authorization: Bearer {token}"
```

---

### Upload Full Surah Audio

```
POST /api/quran/admin/surah/:surahId/audio
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

- `audio` (file, required): Audio file (mp3, m4a, wav, ogg, webm, aac) - max 100MB
- `title` (string, optional): Audio source name (e.g., "Qari Ahmed Al-Ajmi")

**Response (200):**

```json
{
  "data": {
    /* updated Surah object with new audio_urls */
  },
  "message": "Audio uploaded successfully"
}
```

**Example:**

```bash
curl -X POST https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1/audio \
  -H "Authorization: Bearer {token}" \
  -F "audio=@/path/to/surah-1.mp3" \
  -F "title=Qari Ahmed Al-Ajmi"
```

**File Storage:**

- Files are stored in: `data/quran/surah/`
- Public URL: `/files/quran/surah/{filename}`

---

### Upload Verse Audio

```
POST /api/quran/admin/surah/:surahId/verse/:verseId/audio
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

- `audio` (file, required): Audio file (mp3, m4a, wav, ogg, webm, aac) - max 100MB
- `title` (string, optional): Audio source name

**Response (200):**

```json
{
  "data": {
    /* updated verse object with new audio_sources */
  },
  "message": "Audio uploaded successfully"
}
```

**Example:**

```bash
curl -X POST https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1/verse/1/audio \
  -H "Authorization: Bearer {token}" \
  -F "audio=@/path/to/verse-1-1.mp3" \
  -F "title=Qari Ahmed Al-Ajmi"
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid Surah ID (must be 1-114)"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized: No token provided"
}
```

### 403 Forbidden

```json
{
  "message": "Forbidden: Admin access required"
}
```

### 404 Not Found

```json
{
  "error": "Surah not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to load Quran data"
}
```

---

## Data Structure

### Surah Object

```json
{
  "_id": "ObjectId",
  "id": 1,
  "name_ar": "الفاتحة",
  "name_bn": "আল-ফাতিহা",
  "name_en": "Al-Fatihah",
  "type": "meccan",
  "total_verses": 7,
  "order_revelation": 5,
  "verses": [
    {
      "id": 1,
      "text_ar": "string",
      "bn_meaning": "string",
      "bn_pronunciation": "string",
      "audio_sources": [
        {
          "title": "string",
          "url": "string",
          "format": "mp3|m4a|wav|ogg|webm|aac",
          "duration_seconds": "number"
        }
      ]
    }
  ],
  "audio_urls": [
    {
      "title": "string",
      "url": "string",
      "format": "mp3|m4a|wav|ogg|webm|aac",
      "duration_seconds": "number"
    }
  ],
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

---

## Limitations & Notes

1. **Audio Files**: Max 100MB per file. Files stored in `data/quran/surah/`
2. **Search**: Uses MongoDB full-text indexes on Arabic text, Bengali meaning, and Surah names
3. **Pagination**: Default limit is 114 (all Surahs). Adjust with `limit` parameter
4. **ID Constraints**: Surah IDs must be 1-114, verse IDs must be unique within Surah
5. **Type Values**: Only `meccan` or `medinan` are valid
6. **No Verse Limit**: Total verses not enforced; add as many as needed

---

## Testing with cURL

### 1. Get All Surahs (No Auth)

```bash
curl https://siraatul-backend.hcsb.org.bd/api/quran
```

### 2. Search (No Auth)

```bash
curl "https://siraatul-backend.hcsb.org.bd/api/quran/search?q=Al-Fatihah"
```

### 3. Create Surah (With Auth)

```bash
curl -X POST https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 2,
    "name_ar": "البقرة",
    "name_bn": "আল-বাকারাহ",
    "name_en": "Al-Baqarah",
    "type": "medinan",
    "total_verses": 286,
    "verses": []
  }'
```

### 4. Upload Audio (With Auth)

```bash
curl -X POST https://siraatul-backend.hcsb.org.bd/api/quran/admin/surah/1/audio \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "audio=@./surah-1.mp3" \
  -F "title=Qari Ahmed Al-Ajmi"
```

---

## Getting Started

1. **Prepare Quran Data**: Create a JSON file with all Surahs and verses
2. **Import Data**: Run `node scripts/importQuranData.js your-data.json`
3. **Test Public Routes**: Use GET endpoints to verify data was imported
4. **Create Admin User**: Add a user with `role: "admin"` through auth system
5. **Add Audio**: Upload audio files using admin endpoints
6. **Deploy**: API is ready for production!
