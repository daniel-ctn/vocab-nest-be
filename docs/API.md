# VocabNest API

All successful responses use:

```json
{
  "data": {},
  "meta": {}
}
```

All errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

Use `Authorization: Bearer <accessToken>` for protected routes.

## Auth

### POST `/auth/register`

```json
{
  "email": "demo@vocabnest.local",
  "name": "Demo User",
  "password": "password123"
}
```

### POST `/auth/login`

```json
{
  "email": "demo@vocabnest.local",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "user-id",
      "email": "demo@vocabnest.local",
      "name": "Demo User",
      "createdAt": "2026-05-02T00:00:00.000Z",
      "updatedAt": "2026-05-02T00:00:00.000Z"
    },
    "accessToken": "jwt"
  }
}
```

### GET `/auth/me`

Returns the current user profile.

## Vocabulary Search

### POST `/vocabulary/search`

```json
{
  "query": "negotiate"
}
```

Response includes `demoMode: true` when no `OPENAI_API_KEY` is configured.

## Dictionary

### POST `/vocabulary`

Save a generated vocabulary result. The backend does not save search results automatically.

```json
{
  "word": "negotiate",
  "normalizedWord": "negotiate",
  "isPhrase": false,
  "partOfSpeech": "verb",
  "cefrLevel": "B2",
  "englishDefinition": "To discuss something in order to reach an agreement.",
  "vietnameseMeaning": "đàm phán, thương lượng",
  "simpleExplanation": "Talk with someone to agree on terms.",
  "pronunciation": "nih-GOH-shee-ayt",
  "ipa": "/nəˈɡoʊʃieɪt/",
  "synonyms": ["bargain"],
  "antonyms": ["refuse"],
  "examples": ["We negotiated a better price."],
  "collocations": ["negotiate a contract"],
  "usageNotes": "Common in business contexts.",
  "commonMistakes": [],
  "wordFamily": ["negotiation"],
  "tags": ["business"],
  "difficulty": "medium",
  "favorite": false
}
```

### GET `/vocabulary`

Supported query params:

- `q`
- `groupId`
- `difficulty`
- `cefrLevel`
- `partOfSpeech`
- `favorite`
- `sort`: `newest`, `oldest`, `alphabetical`, `lastReviewed`

### PATCH `/vocabulary/:id/favorite`

```json
{
  "favorite": true
}
```

### PATCH `/vocabulary/:id/difficulty`

```json
{
  "difficulty": "hard"
}
```

### POST `/vocabulary/:id/groups`

Replaces the word's group assignments.

```json
{
  "groupIds": ["group-id"]
}
```

## Groups

### POST `/groups`

```json
{
  "name": "Business",
  "description": "Work vocabulary",
  "color": "#2563eb"
}
```

### GET `/groups/:id/vocabulary`

Returns saved vocabulary in the group.

## Daily Practice

### GET `/practice/today`

Returns today's existing practice or creates one with up to 10 vocabulary items.

### POST `/practice/:id/items/:itemId/review`

```json
{
  "rating": "good"
}
```

The review updates the item rating, vocabulary `reviewCount`, `lastReviewedAt`, and simple difficulty state.

### POST `/practice/:id/complete`

Marks the practice as completed.

## Search History

### GET `/search-history`

Returns paginated user search history.

### GET `/search-history/:id`

Returns one search history item.

## Dashboard

### GET `/dashboard/summary`

Returns total vocabulary, group counts, today's practice status, difficult/favorite counts, recent words, and due practice words.
