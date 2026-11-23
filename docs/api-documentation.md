# REST API Documentation

Base URL: `http://localhost:5000/api`

Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | Yes | Current user |
| GET | `/documents` | Yes | List accessible documents |
| POST | `/documents` | Yes | Create document |
| GET | `/documents/:id` | Yes | Read document |
| PUT | `/documents/:id` | Yes | Update title/content with version |
| DELETE | `/documents/:id` | Yes | Delete owned document |
| POST | `/documents/:id/share` | Yes | Add collaborator |
| POST | `/documents/:id/transition` | Yes | Apply DFA action |
| GET | `/documents/:id/activities` | Yes | Activity history |

## Example payloads

Register:
```json
{"name":"Student One","email":"student1@example.com","password":"password123"}
```

Create:
```json
{"title":"CN Assignment"}
```

Update:
```json
{"title":"CN Assignment","content":"Updated content","version":0}
```

Transition:
```json
{"action":"EDIT"}
```

Share:
```json
{"email":"student2@example.com"}
```

## Common status codes
- 200: successful request
- 201: resource created
- 400: invalid input or rejected DFA transition
- 401: missing/invalid authentication
- 403: authenticated user lacks permission
- 404: resource/user not found
- 409: document version conflict
- 423: document locked
- 500: unexpected server error
